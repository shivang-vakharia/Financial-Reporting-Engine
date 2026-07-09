import React, { useEffect, useMemo, useState } from 'react';
import Field from "../common/Field";
import AsyncButton from "../common/AsyncButton";
import AsyncDeleteButton from "../common/AsyncDeleteButton";
import labelize from "../../utils/labelize";
import { api } from "../../services/api";
import useAsyncStatus from "../../hooks/useAsyncStatus";
import Panel from "../common/Panel"

export default function CompanyMetadata({ company, onSaved, onDeleted }) {
    const [form, setForm] = useState({});

    const [touched, setTouched] = useState({});

    const requiredFields = [
      "name",
      "cin",
      "registeredOffice",
      "auditStatus",
      "boardMeetingDate",
      "paidUpCapital",
      "faceValue",
      "directorName",
      "din",
      "place"
    ];

    const isMetadataValid = requiredFields.every(
      (field) => (form[field] ?? "").toString().trim() !== ""
    );

    const { loading, success, run } = useAsyncStatus();
    useEffect(() => {
      if (!company) return;

      setForm({
        ...company.metadata,
        name: company.name,
        cin: company.cin,
        registeredOffice: company.registeredOffice,
      });

      setTouched({});
    }, [company?.id]);
    if (!company) 
      return <Panel title="Company Metadata">
        <p className="muted">
          Create a company to begin.
        </p>
      </Panel>;

    async function save(event) {
      event.preventDefault();

      await run(async () => {
        await api(`/companies/${company.id}/metadata`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });
        setTouched({});
        onSaved();
      });
    }
    return (
      <Panel title="Report Metadata" actions={
        <AsyncDeleteButton
            companyId={company.id}
            onDeleted={onDeleted}
        />
      }>
        <form className="metadata-grid" onSubmit={save}>
          {['name', 
            'cin',
            'registeredOffice',
            'auditStatus',
            'boardMeetingDate',
            'paidUpCapital',
            'faceValue',
            'directorName',
            'din',
            'place'
          ].map((key) => (
            <Field
              key={key}
              label={labelize(key)}
              value={form[key] || ""}
              error={
                touched[key] &&
                (form[key] ?? "").toString().trim() === ""
              }
              onChange={(value) =>
                setForm({
                    ...form,
                    [key]: value,
                })
              }
              onBlur={() =>
                setTouched((previous) => ({
                  ...previous,
                  [key]: true,
                }))
              }
            />

          ))}
          <AsyncButton
            loading={loading}
            success={success}
            type="submit"
            disabled={!isMetadataValid}
        >
            {loading
                ? "Saving..."
                : success
                ? "Saved"
                : "Save Metadata"}
        </AsyncButton>
        </form>
      </Panel>
    );
}