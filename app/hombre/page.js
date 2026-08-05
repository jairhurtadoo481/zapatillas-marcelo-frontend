import GridCategoria from "../../components/GridCategoria";

export default async function HombrePage({ searchParams }) {
  const params = await searchParams;
  return <GridCategoria categoria="hombre" titulo="Hombre" searchParams={params} />;
}