<p align="center"><a href="https://github.com/markocupic"><img src="docs/logo.png" width="200"></a></p>

# Contao News Infinite Scroll
Dieses Frontend-Modul für [Contao CMS](https://contao.org) ermöglicht das Nachladen von Newsartikeln nach domready.
 Sobald ein im Template definierter Anker durch Scrollen erreicht wird,
 werden automatisch/manuell per Ajax die weiteren News-Artikel nachgeladen. Ab Version 2.x besteht keine Abhängigkeit mehr zu **kein jQuery**. JQuery muss im Layout nicht mehr eingebunden werden.

## Installation
Per Contao Manager oder über die Konsole mit
```bash
composer require markocupic/contao-news-infinite-scroll-bundle
```
Nach dem Installationsprozess muss abschliessend noch die Datenbank aktualisiert werden.

## Betrieb
Damit das Modul funktioniert, muss die Paginierung in der Moduleinstellung aktiviert werden.
 Zudem sollte das Template "js_contao_news_infinite_scroll" im Layout eingebunden sein.
 Im Frontend sollten nun beim Erreichen des letzten Artikels je nach Einstellung im Template durch Scrollen oder Drücken des Buttons weitere Artikel nachgeladen werden.

## Einstellungen
Um die Standardeinstellungen im Template
 `vendor\markocupic\contao-news-infinite-scroll-bundle\contao\templates\js\js_news_infinite_scroll.html.twig`
 updatesicher zu überschreiben, legen Sie ein neues Template in `templates/js_news_infinite_scroll.html.twig` an.

https://user-images.githubusercontent.com/1525166/145197724-8bf6fa5b-79ad-49c9-93d7-6af45d37d721.mp4




