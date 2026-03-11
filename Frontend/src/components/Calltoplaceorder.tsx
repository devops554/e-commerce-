
"use client";

import React, { useState, useEffect } from 'react';

interface CallSupportBannerProps {
    phoneNumber?: string;
}

export const CallSupportBanner = ({ phoneNumber = "+91 8581 901 902" }: CallSupportBannerProps) => {
    const [ring, setRing] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setRing(true);
            setTimeout(() => setRing(false), 700);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <a
            href={`tel:${phoneNumber}`}
            className="block w-full max-w-sm mx-auto "
        >
            <div
                style={{
                    background: 'linear-gradient(135deg, #ff6eb4 0%, #ff3d9a 50%, #e0197d 100%)',
                    borderRadius: '24px',
                    padding: '0',
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(255,61,154,0.35), 0 2px 8px rgba(255,61,154,0.2)',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'stretch',
                    minHeight: '100px',
                    fontFamily: "'Nunito', sans-serif",
                }}
            >
                {/* Decorative blobs */}
                <div style={{
                    position: 'absolute', top: '-18px', right: '90px',
                    width: '80px', height: '80px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.10)',
                    pointerEvents: 'none'
                }} />
                <div style={{
                    position: 'absolute', bottom: '-20px', left: '80px',
                    width: '60px', height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                    pointerEvents: 'none'
                }} />

                {/* Girl illustration side */}
                <div style={{
                    width: '105px',
                    minWidth: '105px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    paddingTop: '10px',
                }}>
                    {/* Girl SVG illustration */}
                    <svg
                        viewBox="0 0 100 120"
                        width="100"
                        height="120"
                        style={{ display: 'block' }}
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* Hair back */}
                        <ellipse cx="50" cy="30" rx="22" ry="24" fill="#3d1a00" />

                        {/* Headset band */}
                        <path d="M28 30 Q50 8 72 30" stroke="#222" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                        {/* Headset left cup */}
                        <rect x="23" y="29" width="10" height="14" rx="5" fill="#222" />
                        {/* Headset right cup */}
                        <rect x="67" y="29" width="10" height="14" rx="5" fill="#222" />
                        {/* Mic boom */}
                        <path d="M27 41 Q18 52 22 58" stroke="#222" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                        <circle cx="22" cy="59" r="3" fill="#ff3d9a" />

                        {/* Face */}
                        <ellipse cx="50" cy="36" rx="17" ry="18" fill="#FDBCB4" />

                        {/* Hair front */}
                        <path d="M33 28 Q35 18 50 16 Q65 18 67 28 Q62 22 50 21 Q38 22 33 28Z" fill="#3d1a00" />
                        {/* Side hair */}
                        <path d="M33 28 Q28 36 30 46 Q33 38 35 34Z" fill="#3d1a00" />
                        <path d="M67 28 Q72 36 70 46 Q67 38 65 34Z" fill="#3d1a00" />

                        {/* Eyes */}
                        <ellipse cx="43" cy="36" rx="2.5" ry="2.8" fill="#3d1a00" />
                        <ellipse cx="57" cy="36" rx="2.5" ry="2.8" fill="#3d1a00" />
                        {/* Eye shine */}
                        <circle cx="44.2" cy="34.8" r="0.9" fill="white" />
                        <circle cx="58.2" cy="34.8" r="0.9" fill="white" />

                        {/* Smile */}
                        <path d="M43 44 Q50 50 57 44" stroke="#e07070" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                        {/* Blush */}
                        <ellipse cx="38" cy="42" rx="4" ry="2.5" fill="rgba(255,150,150,0.35)" />
                        <ellipse cx="62" cy="42" rx="4" ry="2.5" fill="rgba(255,150,150,0.35)" />

                        {/* Neck */}
                        <rect x="45" y="53" width="10" height="9" rx="4" fill="#FDBCB4" />

                        {/* Uniform / top - pink */}
                        <path d="M28 95 Q28 68 50 65 Q72 68 72 95Z" fill="#fff" />
                        <path d="M28 95 Q28 68 50 65 Q72 68 72 95Z" fill="rgba(255,61,154,0.15)" />
                        {/* Collar */}
                        <path d="M44 65 Q50 72 56 65" stroke="#ff3d9a" strokeWidth="2" fill="none" />

                        {/* Left arm raised - wave */}
                        <path d="M28 72 Q14 66 12 56 Q10 50 16 48" stroke="#FDBCB4" strokeWidth="7" fill="none" strokeLinecap="round" />
                        {/* Hand */}
                        <circle cx="16.5" cy="46.5" r="5.5" fill="#FDBCB4" />
                        {/* Fingers wave */}
                        <path d="M13 42 Q12 38 14 37" stroke="#FDBCB4" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                        <path d="M16 41 Q15 37 17 36" stroke="#FDBCB4" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                        <path d="M19 42 Q19 38 20 37" stroke="#FDBCB4" strokeWidth="2.5" fill="none" strokeLinecap="round" />

                        {/* Right arm down */}
                        <path d="M72 72 Q82 76 83 86" stroke="#FDBCB4" strokeWidth="7" fill="none" strokeLinecap="round" />
                    </svg>
                </div>

                {/* Text content */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '16px 16px 16px 4px',
                    gap: '4px',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '2px',
                    }}>
                        <span style={{
                            background: 'rgba(255,255,255,0.22)',
                            borderRadius: '20px',
                            padding: '2px 10px',
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: 800,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                        }}>Live Support</span>
                        {/* Pulsing green dot */}
                        <span style={{ position: 'relative', display: 'inline-block', width: 8, height: 8 }}>
                            <span style={{
                                display: 'block', width: 8, height: 8,
                                borderRadius: '50%', background: '#4ade80',
                                position: 'relative', zIndex: 1,
                            }} />
                            <span style={{
                                display: 'block', width: 8, height: 8,
                                borderRadius: '50%', background: 'rgba(74,222,128,0.5)',
                                position: 'absolute', top: 0, left: 0,
                                animation: 'pulse-ring 1.5s ease-out infinite',
                            }} />
                        </span>
                    </div>

                    <div style={{ color: 'white', fontSize: '13px', fontWeight: 700, lineHeight: 1.3 }}>
                        Talk to us to place your order!
                    </div>

                    {/* Phone number pill */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '7px',
                        background: 'white',
                        borderRadius: '30px',
                        padding: '6px 14px',
                        marginTop: '6px',
                        width: 'fit-content',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
                    }}>
                        {/* Phone icon with ring animation */}
                        <svg
                            width="15" height="15" viewBox="0 0 24 24" fill="none"
                            stroke="#e0197d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                            style={{
                                transform: ring ? 'rotate(20deg)' : 'rotate(0deg)',
                                transition: 'transform 0.15s ease',
                                flexShrink: 0,
                            }}
                        >
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.09 9.81 19.79 19.79 0 01.07 1.18 2 2 0 012.06 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                        </svg>
                        <span style={{
                            color: '#e0197d',
                            fontWeight: 900,
                            fontSize: '13px',
                            letterSpacing: '0.04em',
                        }}>{phoneNumber}</span>
                    </div>
                </div>

                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');
                    @keyframes pulse-ring {
                        0% { transform: scale(1); opacity: 0.7; }
                        100% { transform: scale(2.5); opacity: 0; }
                    }
                `}</style>
            </div>
        </a>
    );
};

export default CallSupportBanner;