/**
 * Azure Service for fetching Resource Graph and Cost Management data.
 */

const MANAGEMENT_BASE_URL = "https://management.azure.com";
const GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0";

const costCache = {
  data: {},
  expiry: {}
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const wrapWithRetry = async (fn, retries = 3, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fn();
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : delay * (i + 1);
        console.warn(`Rate limited. Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      return response;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
};

export const fetchUserProfilePhoto = async (accessToken) => {
  try {
    const response = await fetch(`${GRAPH_BASE_URL}/me/photo/$value`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (!response.ok) return null;
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error("Failed to fetch profile photo:", err);
    return null;
  }
};

const parseResourceGraphResponse = (result) => {
  if (!result || !result.data) return [];
  
  // Case 1: data is already an array of objects
  if (Array.isArray(result.data)) {
    return result.data;
  }
  
  // Case 2: data is a table with rows and columns
  if (result.data.columns && result.data.rows) {
    const columns = result.data.columns.map(c => c.name);
    return result.data.rows.map(row => {
      const obj = {};
      columns.forEach((col, index) => {
        obj[col] = row[index];
      });
      return obj;
    });
  }
  
  return [];
};

export const fetchResourceInventory = async (accessToken) => {
  const query = "resources | project id, name, type, location, resourceGroup, subscriptionId | order by name asc";
  const result = await callResourceGraph(accessToken, query);
  return parseResourceGraphResponse(result);
};

export const fetchOrphanedResources = async (accessToken) => {
  const query = `
    resources 
    | where type has "microsoft.compute/disks" and properties.diskState == "Unattached"
    | union (resources | where type contains 'publicIPAddresses' and properties.ipConfiguration == "")
    | union (resources | where type == 'microsoft.network/networkinterfaces' and properties.hostedWorkloads == "")
    | project id, name, type, location, resourceGroup, subscriptionId, properties
  `;
  const result = await callResourceGraph(accessToken, query);
  return parseResourceGraphResponse(result);
};

export const createBudget = async (accessToken, subscriptionId, amount, contactEmails) => {
  const url = `${MANAGEMENT_BASE_URL}/subscriptions/${subscriptionId}/providers/Microsoft.Consumption/budgets/MonthlyDashboardBudget?api-version=2021-10-01`;
  
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = (now.getUTCMonth() + 1).toString().padStart(2, '0');
  const startDate = `${year}-${month}-01T00:00:00Z`;
  
  // End date exactly one year from now
  const nextYear = year + 1;
  const endDate = `${nextYear}-${month}-01T00:00:00Z`;

  const body = {
    properties: {
      category: "Cost",
      amount: amount,
      timeGrain: "Monthly",
      timePeriod: {
        startDate: startDate,
        endDate: endDate
      },
      notifications: {
        Actual_GreaterThan_80_Percent: {
          enabled: true,
          operator: "GreaterThan",
          threshold: 80,
          thresholdType: "Actual",
          contactEmails: contactEmails || []
        }
      }
    }
  };

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Azure API error");
  }

  return response.json();
};

export const fetchResourceCosts = async (accessToken, subscriptionId) => {
  const cacheKey = `resourceCosts-${subscriptionId}`;
  if (costCache.data[cacheKey] && Date.now() < costCache.expiry[cacheKey]) {
    return costCache.data[cacheKey];
  }

  const url = `${MANAGEMENT_BASE_URL}/subscriptions/${subscriptionId}/providers/Microsoft.CostManagement/query?api-version=2023-03-01`;
  
  const body = {
    type: "Usage",
    timeframe: "MonthToDate",
    dataset: {
      granularity: "None",
      aggregation: {
        totalCost: {
          name: "PreTaxCost",
          function: "Sum"
        }
      },
      grouping: [
        {
          type: "Dimension",
          name: "ResourceId"
        }
      ]
    }
  };

  const response = await wrapWithRetry(() => fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }));

  const data = await response.json();
  
  const costMap = {};
  if (data.properties && data.properties.rows) {
    data.properties.rows.forEach(row => {
      const cost = row[0];
      const resourceId = row[1]?.toLowerCase();
      if (resourceId) {
        costMap[resourceId] = cost;
      }
    });
  }
  
  costCache.data[cacheKey] = costMap;
  costCache.expiry[cacheKey] = Date.now() + CACHE_DURATION;
  
  return costMap;
};

export const fetchActualCost = async (accessToken, subscriptionId) => {
  const cacheKey = `actualCost-${subscriptionId}`;
  if (costCache.data[cacheKey] && Date.now() < costCache.expiry[cacheKey]) {
    return costCache.data[cacheKey];
  }

  const url = `${MANAGEMENT_BASE_URL}/subscriptions/${subscriptionId}/providers/Microsoft.CostManagement/query?api-version=2023-03-01`;
  
  const body = {
    type: "Usage",
    timeframe: "MonthToDate",
    dataset: {
      granularity: "None",
      aggregation: {
        totalCost: {
          name: "PreTaxCost",
          function: "Sum"
        }
      }
    }
  };

  const response = await wrapWithRetry(() => fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }));

  const data = await response.json();
  
  let totalUsage = 0;
  if (data.properties && data.properties.rows && data.properties.rows.length > 0) {
    totalUsage = data.properties.rows[0][0];
  }
  
  costCache.data[cacheKey] = totalUsage;
  costCache.expiry[cacheKey] = Date.now() + CACHE_DURATION;
  
  return totalUsage;
};

export const fetchBudgets = async (accessToken, subscriptionId) => {
  const url = `${MANAGEMENT_BASE_URL}/subscriptions/${subscriptionId}/providers/Microsoft.Consumption/budgets?api-version=2021-10-01`;
  
  const response = await wrapWithRetry(() => fetch(url, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  }));
  
  const data = await response.json();
  return data.value || [];
};

export const fetchSubscriptions = async (accessToken) => {
  const response = await fetch(`${MANAGEMENT_BASE_URL}/subscriptions?api-version=2020-01-01`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  return response.json();
};

const callResourceGraph = async (accessToken, query) => {
  const url = `${MANAGEMENT_BASE_URL}/providers/Microsoft.ResourceGraph/resources?api-version=2021-03-01`;
  const body = { queries: [{ query }] };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  return response.json();
};
