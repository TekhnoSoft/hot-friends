import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import './style.css';

const ProfileBannerItem = ({ profile }) => {

    const handleProfileClick = (profile) => {
        console.log('Navigate to profile:', profile.name);
    };

    return (
        <div className={`recommendedprofiles-item-wrapper recommendedprofiles-item-wrapper-${profile.id}`} style={{ marginBottom: '5px' }}>
            <div
                key={profile.id}
                className="recommendedprofiles-card"
                onClick={() => handleProfileClick(profile)}
            >
                <div className="recommendedprofiles-banner">
                    <img
                        src={profile.coverImage || profile.avatar}
                        alt=""
                        className="recommendedprofiles-banner-image"
                        loading="lazy"
                        draggable={false}
                    />

                    <div className="recommendedprofiles-banner-overlay"></div>

                    <div className="recommendedprofiles-avatar-container">
                        <img
                            src={profile.avatar}
                            alt={profile.name}
                            className="recommendedprofiles-avatar"
                            loading="lazy"
                            draggable={false}
                        />
                    </div>

                    <div className="recommendedprofiles-text">
                        <div className="recommendedprofiles-name-container">
                            <h4 className="recommendedprofiles-name">{profile.name}</h4>
                            {profile.isVerified && (
                                <div className="recommendedprofiles-verification-badge">
                                    <Check size={12} />
                                </div>
                            )}

                        </div>
                        <p className="recommendedprofiles-username">@{profile.username}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileBannerItem;