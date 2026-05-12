import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <div data-aos="fade-up" className="footer_main">
            <div className="footer_Icons">
                <span className="footer_git">
                    <a target="_blank" rel="noreferrer noopener" href="https://github.com/ajf013" aria-label="GitHub">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                    </a>
                </span>
                <span className="footer_link">
                    <a target="_blank" rel="noreferrer noopener" href="https://www.linkedin.com/in/ajf013-francis-cruz/" aria-label="LinkedIn">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                    </a>
                </span>
                <span className="footer_insta">
                    <a target="_blank" rel="noreferrer noopener" href="https://www.instagram.com/fcruz_013/" aria-label="Instagram">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                    </a>
                </span>
                <span className="footer_wht">
                    <a target="_blank" rel="noreferrer noopener" href="https://api.whatsapp.com/send?phone=916379649461" aria-label="WhatsApp">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </a>
                </span>
                <span className="footer_twi">
                    <a target="_blank" rel="noreferrer noopener" href="https://x.com/Itsme_Ajf013" aria-label="X (formerly Twitter)">
                        <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: '26px', height: '26px', fill: 'currentColor', verticalAlign: 'middle', marginTop: '-3px' }}>
                            <g>
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                            </g>
                        </svg>
                    </a>
                </span>
            </div>
            <div className="footer_content">
                <span>Copyrights <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', margin: '0 4px' }}><circle cx="12" cy="12" r="10"/><path d="M15 9.354a4 4 0 1 0 0 5.292"/></svg>{new Date().getFullYear()} <strong>Francis Cruz</strong></span>
            </div>
        </div>
    );
};

export default Footer;
