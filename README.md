# Asimilare — Biserica Harvest Arad

Aplicație instalabilă pentru coordonatorii echipelor de Asimilare: cine e
programat duminica ce vine, cine a confirmat, cine a venit.

Se instalează pe telefon ca orice aplicație (Android: *Instalează aplicația*;
iPhone: din Safari, *Adaugă la ecranul principal*), dar e o pagină web — nu trece
prin niciun magazin.

## Cum funcționează

Aici stă doar interfața. Datele — oamenii, confirmările, prezența — sunt într-un
Google Sheet privat, iar un script Apps Script răspunde în JSON. Fiecare cerere
trebuie să vină cu un token care spune cine ești: coordonatorii își văd doar
echipa lor, și nu pot ajunge la alta schimbând adresa.

Fără token valid, aplicația nu arată nimic.

## Fișiere

| | |
|---|---|
| `index.html` | aplicația |
| `manifest.webmanifest` | numele, culorile, iconița |
| `sw.js` | pornirea fără semnal — ține în memorie doar coaja, niciodată datele |
| `icon.png` | iconița |

`index.html` **nu se editează direct**: se generează dintr-o singură sursă de
interfață, ca pagina servită din Apps Script și aplicația să nu se despartă în
timp. Scripturile care o generează stau lângă proiect, nu aici.
