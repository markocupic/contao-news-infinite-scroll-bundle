<?php

declare(strict_types=1);

/*
 * This file is part of Contao News Infinite Scroll Bundle.
 *
 * (c) Marko Cupic <m.cupic@gmx.ch>
 * @license LGPL-3.0+
 * For the full copyright and license information,
 * please view the LICENSE file that was distributed with this source code.
 * @link https://github.com/markocupic/contao-news-infinite-scroll-bundle
 */

namespace Markocupic\ContaoNewsInfiniteScrollBundle\Tests\ContaoManager;

use Contao\ManagerPlugin\Bundle\Config\BundleConfig;
use Contao\ManagerPlugin\Bundle\Parser\DelegatingParser;
use Contao\NewsBundle\ContaoNewsBundle;
use Markocupic\ContaoNewsInfiniteScrollBundle\ContaoManager\Plugin;
use Markocupic\ContaoNewsInfiniteScrollBundle\MarkocupicContaoNewsInfiniteScrollBundle;
use PHPUnit\Framework\TestCase;

class PluginTest extends TestCase
{
    public function testReturnsTheBundles(): void
    {
        $bundles = (new Plugin())->getBundles(new DelegatingParser());

        $this->assertCount(1, $bundles);
        $this->assertInstanceOf(BundleConfig::class, $bundles[0]);
        $this->assertSame(MarkocupicContaoNewsInfiniteScrollBundle::class, $bundles[0]->getName());
        $this->assertSame([ContaoNewsBundle::class], $bundles[0]->getLoadAfter());
    }
}
