<p align="center"><a href="https://github.com/markocupic"><img src="docs/logo.png" width="200"></a></p>

# Contao News Infinite Scroll
Dieses Frontend-Modul für [Contao CMS](https://contao.org) ermöglicht das Nachladen von Newsartikeln nach domready.
 Sobald ein im Template definierter Anker durch Scrollen erreicht wird,
 werden automatisch/manuell per Ajax die weiteren News-Artikel nachgeladen.

## Anforderungen

- PHP ^8.2
- Contao ^5.3 || ^6.0

## Installation
Per Contao Manager oder über die Konsole mit
```bash
composer require markocupic/contao-news-infinite-scroll-bundle
```
Nach dem Installationsprozess muss abschliessend noch die Datenbank aktualisiert werden.
```bash
php vendor/bin/contao-console contao:migrate
```

## Modulkonfiguration
* Im Contao Backend muss als Erstes ein neues Modul `Newslist Infinite Scroll` angelegt werden.
* **Wichtig!** In der Moduleinstellung muss die Paginierung aktiviert werden: Wählen Sie für das Feld `Elemente pro Seite`eine Zahl grösser als 0.
* Das Modul verwendet standardmässig das Template `mod_newslist_inf_scroll`.
* **Wichtig!** Wechseln Sie im Contao Backend zu *Themes -> Layout* und binden Sie im Seitenlayout das Template `js_news_infinite_scroll` ein.

**Geschafft!** :wink: Im Frontend sollten nun beim Erreichen des letzten Artikels je nach Einstellung im Template (siehe unten) durch Scrollen oder Drücken des Buttons weitere Artikel nachgeladen werden.

## Templates
Alle Templates sind Twig-Templates (Contao 6 unterstützt keine `.html5`-Templates mehr):

| Template | Zweck |
|---|---|
| `mod_newslist_inf_scroll.html.twig` | Modul-Template |
| `_mod_newslist_infinite_scroll_ajax.html.twig` | Markup der per Ajax nachgeladenen Artikel |
| `js_news_infinite_scroll.html.twig` | JavaScript-Initialisierung (im Seitenlayout einbinden) |

## Weitere Einstellungen
Um die Standardeinstellungen im Template
 `vendor/markocupic/contao-news-infinite-scroll-bundle/contao/templates/twig/js_news_infinite_scroll.html.twig`
 updatesicher zu überschreiben, legen Sie ein neues Template in `templates/js_news_infinite_scroll.html.twig` an.

## Assets bauen
```bash
npm install
npm run build
```

https://user-images.githubusercontent.com/1525166/145197724-8bf6fa5b-79ad-49c9-93d7-6af45d37d721.mp4
