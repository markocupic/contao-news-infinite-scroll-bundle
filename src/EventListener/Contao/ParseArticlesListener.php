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

namespace Markocupic\ContaoNewsInfiniteScrollBundle\EventListener\Contao;

use Contao\CoreBundle\DependencyInjection\Attribute\AsHook;
use Contao\CoreBundle\Framework\ContaoFramework;
use Contao\Environment;
use Contao\FrontendTemplate;
use Contao\Input;
use Contao\Module;

#[AsHook(ParseArticlesListener::HOOK)]
class ParseArticlesListener
{
    public const HOOK = 'parseArticles';

    public function __construct(
        private readonly ContaoFramework $framework,
    ) {
    }

    /**
     * Add canonical tag.
     */
    public function __invoke(FrontendTemplate $template, array $newsEntry, Module $module): void
    {
        // Prevent duplicate content by adding the canonical url into the head.
        if ('newslist_infinite_scroll' === $module->type && $module->newsInfiniteScroll_addCanonicalTag) {
            $id = 'page_n'.$module->id;

            $environmentAdapter = $this->framework->getAdapter(Environment::class);

            $strTag = sprintf(
                '<link rel="canonical" href="%s">',
                $environmentAdapter->get('url').'/'.str_replace('?'.$environmentAdapter->get('queryString'), '', $environmentAdapter->get('request'))
            );

            $inputAdapter = $this->framework->getAdapter(Input::class);

            if (null !== $inputAdapter->get($id) && isset($GLOBALS['TL_HEAD']) && \is_array($GLOBALS['TL_HEAD']) && !\in_array($strTag, $GLOBALS['TL_HEAD'], true)) {
                $GLOBALS['TL_HEAD'][] = $strTag;
            }
        }
    }
}
