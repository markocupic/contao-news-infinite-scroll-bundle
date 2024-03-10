<?php

declare(strict_types=1);

/*
 * This file is part of Contao News Infinite Scroll Bundle.
 *
 * (c) Marko Cupic 2024 <m.cupic@gmx.ch>
 * @license LGPL-3.0+
 * For the full copyright and license information,
 * please view the LICENSE file that was distributed with this source code.
 * @link https://github.com/markocupic/contao-news-infinite-scroll-bundle
 */

use Markocupic\ModuleNewslistInfiniteScroll;

/**
 * Frontend module
 */
$GLOBALS['FE_MOD']['news']['newslist_infinite_scroll'] = ModuleNewslistInfiniteScroll::class;
