export const escapeHtml = (value: string | number | null | undefined): string =>
	String(value ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");

// Site chrome copied from the static LEDA site so uploaded reports blend in; asset paths are relative.
const SITE_HEADER = `
<div id="header">
<div id="Title">
<span class="title1">
	<img alt="LEDA" class="alignleft" height="66" src="Images/LEDA_thumbnail.jpg" width="100" />Lake Erie Dart Association</span>
<span class="title2">Cleveland's East Side Steel Tip Dart League</span>
</div><!-- End #Title -->
<div id="Address">
<span class="street">7537 Mentor Avenue Suite 107</span>
<span class="city">Mentor, Ohio 44060</span>
<span class="phone">Phone (440) 975-9775</span>
<span class="fax">Fax (440) 975-9220</span>
<span class="email">
	<a href="mailto:office@lakeeriedarts.com?subject=Email From Website">office@lakeeriedarts.com</a></span>
</div><!-- End #Address -->
<div id="menu">
<ul>
	<li><a href="default.html">Home</a></li>
	<li><a onclick="return true">League Information</a>
		<ul>
			<li><a href="Board.html">Board and Committee</a></li>
			<li><a href="ByLaws.html">By-Laws</a></li>
			<li><a href="InfoBook.html">Information Book</a></li>
			<li><a href="Office.html">Office and Contact Info</a></li>
		</ul></li>
	<li><a onclick="return true">Standings</a>
		<ul>
			<li><a href="CurrentStandings.html">Current Standings</a></li>
			<li><a href="TopDarter.html">Current Top Darter</a></li>
			<li><a href="HistoricalStandings.html">Historical Standings</a></li>
		</ul></li>
	<li><a href="Schedules_.html">Schedules</a></li>
	<li><a onclick="return true">Tournaments</a>
		<ul>
			<li><a href="Tournament.html">Upcoming Tournaments</a></li>
			<li><a href="TournamentResults.html">Tournament Results</a></li>
		</ul></li>
	<li><a href="Trails.html">Trails</a></li>
	<li><a onclick="return true">Forms</a>
		<ul>
			<li><a href="Forms.html">Printable Forms</a></li>
			<li><a href="AddPlayer.html">Add a Player</a></li>
			<li><a href="AddressForm.html">Change of Address</a></li>
			<li><a href="EmailRequest.html">Email Request</a></li>
		</ul></li>
</ul>
</div><!-- End #menu -->
</div><!-- End #header -->`;

interface SitePageOptions {
	heading: string;
	subtitle?: string;
	body: string | string[];
	css?: string;
	maxWidth?: string;
}

// Wraps report content in the LEDA website page shell; array bodies are spaced apart like pages.
export function buildSitePageHtml({ heading, subtitle, body, css = "", maxWidth = "800px" }: SitePageOptions): string {
	const content = Array.isArray(body)
		? body.map((part) => `<div style="margin-bottom:16px">${part}</div>`).join("")
		: body;

	return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
<title>${escapeHtml(heading)}</title>
<link href="Styles/Reset.css" rel="stylesheet" type="text/css" />
<link href="Styles/styles.css" rel="stylesheet" type="text/css" />
${css ? `<style>${css}</style>` : ""}
</head>
<body>
<div id="wrapper">${SITE_HEADER}
<div id="Main">
<h1>${escapeHtml(heading)}</h1>
${subtitle ? `<div style="text-align:center;font:bold 12pt Arial">${escapeHtml(subtitle)}</div>` : ""}
</div>
<div id="Report" style="max-width:${maxWidth};margin:16px auto;font-family:Arial,Helvetica,sans-serif">${content}</div>
</div>
</body>
</html>`;
}
