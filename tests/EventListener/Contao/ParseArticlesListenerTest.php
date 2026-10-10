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

namespace Markocupic\ContaoNewsInfiniteScrollBundle\Tests\EventListener\Contao;

use Contao\CoreBundle\Framework\ContaoFramework;
use Contao\Environment;
use Contao\FrontendTemplate;
use Contao\Input;
use Contao\Module;
use Contao\StringUtil;
use Contao\TestCase\ContaoTestCase;
use Markocupic\ContaoNewsInfiniteScrollBundle\EventListener\Contao\ParseArticlesListener;
use Markocupic\ContaoNewsInfiniteScrollBundle\Module\ModuleNewslistInfiniteScroll;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;

#[AllowMockObjectsWithoutExpectations]
class ParseArticlesListenerTest extends ContaoTestCase
{
    protected function tearDown(): void
    {
        unset($GLOBALS['TL_HEAD']);

        parent::tearDown();
    }

    public function testAddsTheCanonicalTagOnce(): void
    {
        $listener = new ParseArticlesListener($this->mockFramework('2'));
        $module = $this->mockModule(ModuleNewslistInfiniteScroll::TYPE, true);

        $listener($this->createStub(FrontendTemplate::class), [], $module);
        $listener($this->createStub(FrontendTemplate::class), [], $module);

        $this->assertSame(['<link rel="canonical" href="https://example.com/news.html">'], $GLOBALS['TL_HEAD']);
    }

    public function testDoesNotAddTheCanonicalTagOnTheFirstPage(): void
    {
        $listener = new ParseArticlesListener($this->mockFramework(null));

        $listener($this->createStub(FrontendTemplate::class), [], $this->mockModule(ModuleNewslistInfiniteScroll::TYPE, true));

        $this->assertEmpty($GLOBALS['TL_HEAD'] ?? []);
    }

    public function testIgnoresOtherModulesAndDisabledSetting(): void
    {
        $listener = new ParseArticlesListener($this->mockFramework('2'));

        $listener($this->createStub(FrontendTemplate::class), [], $this->mockModule('newslist', true));
        $listener($this->createStub(FrontendTemplate::class), [], $this->mockModule(ModuleNewslistInfiniteScroll::TYPE, false));

        $this->assertEmpty($GLOBALS['TL_HEAD'] ?? []);
    }

    private function mockFramework(string|null $page): ContaoFramework
    {
        $environment = $this->mockAdapter(['get']);
        $environment
            ->method('get')
            ->willReturnMap([
                ['url', 'https://example.com'],
                ['request', 'news.html?page_n42=2&foo=bar'],
            ])
        ;

        $input = $this->mockAdapter(['get']);
        $input
            ->method('get')
            ->willReturnCallback(static fn (string $key) => 'page_n42' === $key ? $page : null)
        ;

        $stringUtil = $this->mockAdapter(['specialcharsUrl']);
        $stringUtil
            ->method('specialcharsUrl')
            ->willReturnCallback(static fn (string $url): string => str_replace('&', '&amp;', $url))
        ;

        return $this->mockContaoFramework([
            Environment::class => $environment,
            Input::class => $input,
            StringUtil::class => $stringUtil,
        ]);
    }

    private function mockModule(string $type, bool $addCanonicalTag): Module
    {
        return $this->mockClassWithProperties(Module::class, [
            'id' => 42,
            'type' => $type,
            'newsInfiniteScroll_addCanonicalTag' => $addCanonicalTag,
        ]);
    }
}
