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

namespace Markocupic\ContaoNewsInfiniteScrollBundle\EventListener\Contao;

use Contao\CoreBundle\DependencyInjection\Attribute\AsHook;
use Contao\CoreBundle\Framework\ContaoFramework;
use Contao\Environment;
use Contao\FrontendTemplate;
use Contao\Input;
use Contao\Module;
use Contao\StringUtil;
use Markocupic\ContaoNewsInfiniteScrollBundle\Module\ModuleNewslistInfiniteScroll;

#[AsHook(ParseArticlesListener::HOOK)]
class ParseArticlesListener
{
    public const HOOK = 'parseArticles';

    public function __construct(private readonly ContaoFramework $framework)
    {
    }

    /**
     * Add canonical tag.
     */
    public function __invoke(FrontendTemplate $template, array $newsEntry, Module $module): void
    {
        // Prevent duplicate content by adding the canonical url into the head.
        if (ModuleNewslistInfiniteScroll::TYPE !== $module->type || !$module->newsInfiniteScroll_addCanonicalTag) {
            return;
        }

        // Only add the canonical tag on subsequent pages (e.g. ?page_n12=2)
        if (null === $this->framework->getAdapter(Input::class)->get('page_n'.$module->id)) {
            return;
        }

        $environmentAdapter = $this->framework->getAdapter(Environment::class);

        // Strip the query string from the current url
        $url = $environmentAdapter->get('url').'/'.explode('?', (string) $environmentAdapter->get('request'), 2)[0];

        $strTag = \sprintf('<link rel="canonical" href="%s">', $this->framework->getAdapter(StringUtil::class)->specialcharsUrl($url));

        if (!\is_array($GLOBALS['TL_HEAD'] ?? null)) {
            $GLOBALS['TL_HEAD'] = [];
        }

        if (!\in_array($strTag, $GLOBALS['TL_HEAD'], true)) {
            $GLOBALS['TL_HEAD'][] = $strTag;
        }
    }
}
