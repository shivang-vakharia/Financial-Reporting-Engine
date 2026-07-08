export default function formatMoney(value) {
    return new Intl.NumberFormat('en-IN', {
         maximumFractionDigits: 2 
        }).format(value || 0);
  }