import GridCategoria from "../../components/GridCategoria";

export default async function MujerPage({ searchParams }) {
  const params = await searchParams;
  return <GridCategoria categoria="mujer" titulo="Mujer" searchParams={params} video="/mujer.mp4" />;
}