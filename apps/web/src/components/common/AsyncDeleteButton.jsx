import AsyncButton from "./AsyncButton";
import useAsyncStatus from "../../hooks/useAsyncStatus";

export default function AsyncDeleteButton({
    companyId,
    onDeleted,
  }) {
    const { loading, success, run } =
      useAsyncStatus();

    return (
      <AsyncButton
        className="danger"
        loading={loading}
        success={success}
        onClick={() =>
          run(async () => {
            await onDeleted(companyId);
          })
        }
      >
        {loading
          ? "Deleting..."
          : success
          ? "Deleted"
          : "Delete Company"}
      </AsyncButton>
    );
  }