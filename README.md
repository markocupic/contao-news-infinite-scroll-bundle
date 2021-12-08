<p align="center"><a href="https://github.com/markocupic"><img src="docs/logo.png" width="200"></a></p>

# Contao News Infinite Scroll
Dieses frontend Modul für [Contao CMS](https://contao.org) ermöglicht das Nachladen von Newsartikeln nach domready.
 Sobald ein im Template definierter Anker peim Scrollen erreicht wird,
 werden per Ajax die weiteren News-Artikel nachgeladen.

## Betrieb
Damit das Modul funktioniert, muss die Paginierung in der Moduleinstellung aktiviert werden.
 Zudem sollte das Template "j_contao_news_infinite_scroll" im Layout eingebunden sein.
 Im Frontend sollten nun beim Erreichen des letzten Artikels durch Scrollen weitere Artikel nachgeladen werden.

## Einstellungen
Um die Standardeinstellungen im Template
 `vendor\markocupic\contao-news-infinite-scroll-bundle\src\Resources\contao\templates\jquery\j_news_infinite_scroll.html5`
 updatesicher zu überschreiben, legen Sie ein neues Template in `templates/j_news_infinite_scroll.html5` an.
  Das Template sollte dann updatesicher im templates Verzeichnis abgelegt werden.

