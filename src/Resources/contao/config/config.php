<?php

/*
 * This file is part of Resource Booking Bundle.
 *
 * (c) Marko Cupic 2021 <m.cupic@gmx.ch>
 * @license LGPL-3.0+
 * @link https://github.com/markocupic/contao-news-infinite-scroll-bundle
 */

use Contao\Environment;
use Contao\System;
use Markocupic\ModuleNewslistInfiniteScroll;

/**
 * Load javascript upon ajax requests
 */
if (TL_MODE === 'FE' && !Environment::get('isAjaxRequest'))
{
    $GLOBALS['TL_JAVASCRIPT'][] = 'bundles/markocupiccontaonewsinfinitescroll/js/news_infinite_scroll.min.js|static';
}

/**
 * Frontend module
 */
$GLOBALS['FE_MOD']['news']['newslist_infinite_scroll'] = ModuleNewslistInfiniteScroll::class;

/**
 * Hooks
 */
$GLOBALS['TL_HOOKS']['parseArticles'][] = array('Markocupic\ContaoNewsInfiniteScrollBundle\EventListener\Contao\ParseArticlesListener', 'addCanonicalTag');
