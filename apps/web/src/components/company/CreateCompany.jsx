import AsyncButton from "../common/AsyncButton";


export default function CreateCompany({ onCreated }) {
    const [open, setOpen] = useState(false);

    const [form, setForm] = useState({
      name: "",
      cin: "",
      registeredOffice: "",
    });

    const { loading, success, run } = useAsyncStatus();

    async function submit(event) {
      event.preventDefault();

      await run(async () => {
        const company = await api("/companies", {
          method: "POST",
          body: JSON.stringify(form),
        });

        setOpen(false);

        setForm({
          name: "",
          cin: "",
          registeredOffice: "",
        });

        onCreated(company);
      });
    }

    return open ? (
      <form
        className="inline-form"
        onSubmit={submit}
      >
        <input
          placeholder="Company name"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
        />

        <input
          placeholder="CIN"
          value={form.cin}
          onChange={(e) =>
            setForm({
              ...form,
              cin: e.target.value,
            })
          }
        />

        <AsyncButton
          loading={loading}
          success={success}
          type="submit"
        >
          {loading ? "Saving..." : success ? "Saved" : "Save"}
        </AsyncButton>
      </form>
    ) : (
      <button
        className="primary"
        onClick={() => setOpen(true)}
      >
        <Plus size={16} />
        Add Company
      </button>
    );
}