<p align="center"><a href="https://github.com/markocupic"><img src="docs/logo.png" width="200"></a></p>

# Contao News Infinite Scroll
Dieses Frontend-Modul für [Contao CMS](https://contao.org) ermöglicht das Nachladen von Newsartikeln nach domready.
 Sobald ein im Template definierter Anker durch Scrollen erreicht wird,
 werden automatisch/manuell per Ajax die weiteren News-Artikel nachgeladen.

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
* **Wichtig!** In der Moduleinstellung muss für das Feld `Modul Template` das Template `mod_newslist_inf_scroll` gewählt werden.
* **Wichtig!** Wechseln Sie im Contao Backend zu *Themes -> Layout* und aktivieren Sie das `js_contao_news_infinite_scroll` im Layout eingebunden sein.

**Geschafft!** :wink: Im Frontend sollten nun beim Erreichen des letzten Artikels je nach Einstellung im Template (siehe unten) durch Scrollen oder Drücken des Buttons weitere Artikel nachgeladen werden.

## Weitere Einstellungen
Um die Standardeinstellungen im Template
 `vendor\markocupic\contao-news-infinite-scroll-bundle\contao\templates\js\js_news_infinite_scroll.html.twig`
 updatesicher zu überschreiben, legen Sie ein neues Template in `templates/js_news_infinite_scroll.html.twig` an.

https://user-images.githubusercontent.com/1525166/145197724-8bf6fa5b-79ad-49c9-93d7-6af45d37d721.mp4
