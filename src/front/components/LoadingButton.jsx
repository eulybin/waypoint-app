const LoadingButton = ({ type = "submit", isLoading, loadingText, className, children, ...props }) => {
    return (
        <button
            type={type}
            className={className}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"></span>
                    {loadingText}
                </>
            ) : (
                children
            )}
        </button>
    );
};

export default LoadingButton;