import '../../styles/LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', message = 'Cargando...' }) => {
    return (
        <div className="loading-container">
            <div className={`loading-spinner spinner-${size}`}></div>
            {message && <p className="loading-message">{message}</p>}
        </div>
    );
};

export default LoadingSpinner;