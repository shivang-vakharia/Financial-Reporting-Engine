import LoadingSpinner from "./LoadingSpinner";

export default function ButtonStatusIcon({ loading, success }) {
    if (loading) {
      return <LoadingSpinner size={16} />;
    }

    if (success) {
      return (
        <CheckCircle2
          size={16}
          className="success-icon"
        />
      );
    }

    return null;
  }