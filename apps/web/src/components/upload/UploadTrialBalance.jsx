import Panel from "../common/Panel";
import AsyncButton from "../common/AsyncButton"
import LoadingSpinner from "../common/LoadingSpinner";
import React, { useState, useEffect, useMemo } from "react";
import { api } from "../services/api";
import useAsyncStatus from "../../hooks/useAsyncStatus";
import { Upload, CheckCircle2 } from "lucide-react";

export default function UploadTrialBalance({ period, onUploaded }) {
    const [file, setFile] = useState(null);

    const [dragging, setDragging] =
      useState(false);

    const [status, setStatus] =
      useState("idle");

    const [summary, setSummary] =
      useState(null);

    const {
      loading,
      success,
      run,
    } = useAsyncStatus();

    function readableSize(bytes) {
      if (!bytes) return "";

      if (bytes < 1024)
        return bytes + " B";

      if (bytes < 1024 * 1024)
        return (
          (bytes / 1024).toFixed(1) +
          " KB"
        );

      return (
        (bytes / 1024 / 1024).toFixed(1) +
        " MB"
      );
    }

    async function submit(e) {
      e.preventDefault();

      if (!period || !file) return;

      await run(async () => {
        setStatus("uploading");

        const formData = new FormData();

        formData.append(
          "trialBalance",
          file
        );

        const result = await api(
          `/periods/${period.id}/uploads`,
          {
            method: "POST",
            body: formData,
            isForm: true,
          }
        );

        setStatus("completed");

        setSummary({
          rows:
            result.validation.rowCount,
          mapped:
            result.mappingSummary
              .mapped,
          unmapped:
            result.mappingSummary
              .unmapped,
        });

        onUploaded(result);

        setFile(null);

        setTimeout(() => {
          setStatus("idle");
        }, 1800);
      });
    }

    function onDrop(e) {
      e.preventDefault();

      setDragging(false);

      if (
        e.dataTransfer.files.length
      ) {
        setFile(
          e.dataTransfer.files[0]
        );

        setSummary(null);
      }
    }

    return (
      <Panel title="Upload Trial Balance">
        <form
          className="upload-card"
          onSubmit={submit}
        >
          <div
            className={`drop-zone ${
              dragging
                ? "dragging"
                : ""
            }`}
            onDragOver={(e) => {
              e.preventDefault();

              setDragging(true);
            }}
            onDragLeave={() =>
              setDragging(false)
            }
            onDrop={onDrop}
          >
            <Upload size={42} />

            <h3>
              Upload Excel Workbook
            </h3>

            <p>
              Drag & drop your trial
              balance here
            </p>

            <label className="upload-btn">
              Select Workbook

              <input
                hidden
                type="file"
                accept=".xlsx,.xls,.xlsm"
                onChange={(e) => {
                  if (
                    e.target.files
                      ?.length
                  ) {
                    setFile(
                      e.target.files[0]
                    );

                    setSummary(
                      null
                    );
                  }
                }}
              />
            </label>
          </div>

          {file && (
            <div className="selected-file-card">
              <div className="selected-file-title">
                ✔ Selected File
              </div>

              <div>
                {file.name}
              </div>

              <small>
                {readableSize(
                  file.size
                )}
              </small>
            </div>
          )}

          <div className="upload-status-card">
            <div className="status-title">
              Status
            </div>

            {status === "idle" && (
              <span className="status-chip ready">
                Ready
              </span>
            )}

            {status ===
              "uploading" && (
              <>
                <span className="status-chip processing">
                  <LoadingSpinner />
                  Uploading &
                  Parsing...
                </span>

                <div className="progress-bar">
                  <div className="progress-indeterminate" />
                </div>
              </>
            )}

            {status ===
              "completed" && (
              <span className="status-chip success">
                <CheckCircle2
                  size={15}
                />
                Upload Complete
              </span>
            )}
          </div>

          {summary && (
            <div className="upload-summary">
              <div>
                <span>Rows</span>

                <strong>
                  {summary.rows}
                </strong>
              </div>

              <div>
                <span>
                  Mapped
                </span>

                <strong>
                  {summary.mapped}
                </strong>
              </div>

              <div>
                <span>
                  Unmapped
                </span>

                <strong className="danger">
                  {
                    summary.unmapped
                  }
                </strong>
              </div>
            </div>
          )}

          <AsyncButton
            type="submit"
            loading={loading}
            success={success}
            disabled={
              !file || !period
            }
            className="primary upload-submit"
          >
            {loading
              ? "Parsing..."
              : success
              ? "Completed"
              : "Parse & Map"}
          </AsyncButton>
        </form>
      </Panel>
    );
}