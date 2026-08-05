import GridCategoria from "../../components/GridCategoria";

export default async function NiniosPage({ searchParams }) {
  const params = await searchParams;
  return <GridCategoria categoria="ninios" titulo={"Ni\u00f1os"} searchParams={params} />;
}