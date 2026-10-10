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

namespace Markocupic\ContaoNewsInfiniteScrollBundle\Tests\DataContainer;

use Markocupic\ContaoNewsInfiniteScrollBundle\DataContainer\Module;
use Markocupic\ContaoNewsInfiniteScrollBundle\Module\ModuleNewslistInfiniteScroll;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class ModuleTest extends TestCase
{
    protected function tearDown(): void
    {
        unset($GLOBALS['TL_DCA']);

        parent::tearDown();
    }

    public function testCopiesTheNewslistPalette(): void
    {
        $GLOBALS['TL_DCA']['tl_module']['palettes']['newslist'] = '{title_legend},name,headline,type';

        $this->createListener()->setPalette();

        $this->assertSame('{title_legend},name,headline,type', $GLOBALS['TL_DCA']['tl_module']['palettes'][ModuleNewslistInfiniteScroll::TYPE]);
    }

    private function createListener(): Module
    {
        return new Module(
            new RequestStack(),
            $this->createStub(TokenStorageInterface::class),
            $this->createStub(TranslatorInterface::class),
        );
    }
}
