import { Component } from "react";

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {hasError: false};
    }

    static getDerivedStateFromError() {
        return {
            hasError: true
        };
    }

    componentDidCatch(error, info) {
        console.error("UI Error:", error, info);
        // Future: send to backend audit
    }

    render() {
        if(this.state.hasError) {
            return (
                <div className="h-screen flex items-center justify-center text-gray-700">
                    Something went wrong. Please refresh or log in again.
                </div>
            );
        }

        return this.props.children;
    }
}