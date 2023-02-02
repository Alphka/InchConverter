import { memo, useState, type PropsWithChildren } from "react"
import { Poppins } from "@next/font/google"
import IsNumber from "helpers/IsNumber"
import Script from "next/script"
import Head from "next/head"

declare var Decimal: typeof import("decimal.js").default

type Units = "in" | "mm"

interface SectionProps extends PropsWithChildren {
	unit: Units
	callback: (value: string, unit: Units) => JSX.Element
}

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["400", "500", "600"]
})

const inchToMm = 25.4

function FindDivisor(a: number, b: number){
	while(b !== 0){
		let t = b
		b = a % b
		a = t
	}

	return a
}

function MixedFraction(a: number, b: number){
	const quotient = Math.trunc(a / b)
	const remainder = a % b

	if(remainder === 0) return quotient

	const divisor = FindDivisor(remainder, b)

	return `${divisor} ${remainder / divisor}/${b / divisor}`
}

function GetFractionInch(mm: string){
	const native = Number(mm) / inchToMm
	const decimal = new Decimal(mm).dividedBy(inchToMm)

	if(native % 1 === 0) return native

	if(decimal.equals(native)){
		const integer = Math.trunc(native)
		const fraction = new Decimal(native).sub(integer).toFraction().join("/")

		return integer ? `${integer} ${fraction}` : fraction
	}

	return decimal.times(128).round().dividedBy(128).toFraction().join("/")
}

function GetDecimalInch(mm: string){
	return new Decimal(mm).dividedBy(inchToMm).toFixed(3)
}

function GetInches(mm: string, unit: Units){

	const fraction = GetFractionInch(mm)
	const decimal = GetDecimalInch(mm)
	const mixed = MixedFraction.apply(undefined, typeof fraction === "string" ? fraction.split("/").map(Number) as [number, number] : [fraction, 1])

	return (
		<table>
			<thead>
				<tr>
					<th>Fraction</th>
					<th>Decimal</th>
					<th>Mixed fraction</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>{fraction} {unit}</td>
					<td>{decimal} {unit}</td>
					<td>{mixed} {unit}</td>
				</tr>
			</tbody>
		</table>
	)
}

function GetMillimeters(inches: string, unit: Units){
	return <p>{new Decimal(inches).times(inchToMm).toFixed(3)} {unit}</p>
}

function Section({ children, unit, callback }: SectionProps){
	let setResult: (result: string) => void

	function Result(){
		const [result, setter] = useState<string>()
		setResult ??= setter
		return result && <div className="result">{IsNumber(result) && callback(result, unit)}</div> || null
	}

	return (
		<section>
			<header>
				<h3>{children}</h3>
			</header>
			<div>
				<input type="number" onChange={event => setResult(event.target.value)} />
				<Result />
			</div>
		</section>
	)
}

export default function Index(){
	return (
		<>
			<Head>
				<meta charSet="utf-8" />
				<meta name="author" content="Kayo Souza" />
				<meta name="description" content="A web application to convert inches" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="color-scheme" content="dark" />
				<title>Inch Converter</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<main className={`${poppins.className}`}>
				<article>
					<Section callback={GetInches} unit="in">Convert millimeters into inches:</Section>
					<Section callback={GetMillimeters} unit="mm">Convert inches into millimeters:</Section>
				</article>
			</main>

			<Script src="https://cdnjs.cloudflare.com/ajax/libs/decimal.js/9.0.0/decimal.min.js" integrity="sha512-zPQm8HS4Phjo9pUbbk+HPH3rSWu5H03NFvBpPf6D9EU2xasj0ZxhYAc/lvv/HVDWMSE1Autj19i6nZOfiVQbFQ==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
		</>
	)
}
