import { notFound } from "next/navigation";

export default function Page({ params }: { params: { ledaId: string } }) {

    notFound();
	return <p>LEDA ID # {params.ledaId}</p>;
}
