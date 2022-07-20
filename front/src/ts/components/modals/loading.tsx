import React from "react";

interface props {
    content?: string
}

export default function Loading({ content = "Loading ..." }: props) {
    return (
        <div className="loading-page">
            <div className="loading-content">
                <div className="spinner spinner-border"></div>
                <p>{content}</p>
            </div>
        </div>
    );
}
