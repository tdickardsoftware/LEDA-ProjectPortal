export default function Page({ params }: { params: { ledaId: string } }) {
	return <p>LEDA ID # {params.ledaId}</p>;
}
