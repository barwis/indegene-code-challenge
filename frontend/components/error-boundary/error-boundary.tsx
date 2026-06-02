"use client";

import { Component } from "react";
import type { PropsWithChildren, ReactNode } from "react";

type ErrorBoundaryProps = PropsWithChildren<{
  aside?: ReactNode;
  onReset?: () => void;
}>;

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  handleReset = (): void => {
    this.setState({ hasError: false });
    this.props.onReset?.();
  };

  render(): ReactNode {
    const { children, aside } = this.props;
    const { hasError } = this.state;

    return (
      <>
        {hasError ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-accent-50 p-8 text-center">
            <p className="text-lg text-stone-700">
              Something went wrong. Your recipe session could not be displayed.
            </p>
            <button
              onClick={this.handleReset}
              className="min-h-[50px] rounded-xl bg-amber-600 px-6 font-semibold text-white"
            >
              Start over
            </button>
          </div>
        ) : (
          children
        )}
        {aside}
      </>
    );
  }
}

export { ErrorBoundary };
