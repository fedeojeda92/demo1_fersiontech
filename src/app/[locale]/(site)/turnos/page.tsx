import { getProperties } from "@/lib/data/properties";
import AppointmentForm from "@/components/AppointmentForm";

export default async function AppointmentsPage() {
  const properties = await getProperties();

  return <AppointmentForm properties={properties} />;
}
