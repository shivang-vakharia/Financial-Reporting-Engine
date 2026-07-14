import React, { useState, useEffect, useMemo } from "react";
import { api } from "../../services/api";
import useAsyncStatus from "../../hooks/useAsyncStatus";
import AsyncButton from "../common/AsyncButton";
import { Plus } from "lucide-react";
import { validatePeriod } from "../../validators/period.validator.js";

export default function CreatePeriod({ company, onCreated }) {
    const [open, setOpen] = useState(false);

    const [form, setForm] = useState({
      label: "FY 2025-26 Q1",
      periodType: "quarterly",
      startDate: "2025-04-01",
      endDate: "2025-06-30",
    });

    const { loading, success, run } = useAsyncStatus();

    async function submit(event) {
      event.preventDefault();

      const errors = validatePeriod(form);
      if (errors) {
        alert(Object.values(errors).join("\n"));
        return;
      }

      try {

        await run(async () => {

          const period = await api(
            `/companies/${company.id}/periods`,
            {
              method: "POST",
              body: JSON.stringify(form),
            }
          );

           setOpen(false);
           onCreated(period);
           // Reset form fields after a successful period creation
           setForm({
             label: '',
             periodType: 'quarterly',
             startDate: '',
             endDate: ''
           });

        });

      } catch (error) {

          // Specific handling for duplicate period dates
          if (error.status === 409) {
            alert('A reporting period with these dates already exists for this company.');
            return;
          }

          // Generic error fallback
          alert(error.message);
      }
    }

    return open ? (
      <form
        className="inline-form"
        onSubmit={submit}
      >
        <input
          value={form.label}
          onChange={(e) =>
            setForm({
              ...form,
              label: e.target.value,
            })
          }
        />

        <select
          value={form.periodType}
          onChange={(e) =>
            setForm({
              ...form,
              periodType: e.target.value,
            })
          }
        >
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="half_yearly">Half-yearly</option>
          <option value="annual">Annual</option>
        </select>

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
        className="secondary"
        onClick={() => setOpen(true)}
      >
        <Plus size={16} />
        Add Period
      </button>
    );
}