import React from "react";
import Field from "../common/Field";
import AsyncButton from "../common/AsyncButton";
import AsyncDeleteButton from "../common/AsyncDeleteButton";
import labelize from "../../utils/labelize";

export default function CompanyMetadata({ company, onSaved, onDeleted }) {
    const [form, setForm] = useState({});

    const { loading, success, run } = useAsyncStatus();
    useEffect(() => {
      if (company) setForm({ ...company.metadata, name: company.name, cin: company.cin, registeredOffice: company.registeredOffice });
    }, [company?.id]);
    if (!company) return <Panel title="Company Metadata"><p className="muted">Create a company to begin.</p></Panel>;
    async function save(event) {
      event.preventDefault();

      await run(async () => {
        await api(`/companies/${company.id}/metadata`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });

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
          {['name', 'cin', 'registeredOffice', 'auditStatus', 'boardMeetingDate', 'paidUpCapital', 'faceValue', 'directorName', 'din', 'place'].map((key) => (
            <Field key={key} label={labelize(key)} value={form[key] || ''} onChange={(value) => setForm({ ...form, [key]: value })} />
          ))}
          <AsyncButton
            loading={loading}
            success={success}
            type="submit"
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