<?php

declare(strict_types=1);

/*
 * This file is part of Contao News Infinite Scroll Bundle.
 *
 * (c) Marko Cupic 2023 <m.cupic@gmx.ch>
 * @license LGPL-3.0+
 * For the full copyright and license information,
 * please view the LICENSE file that was distributed with this source code.
 * @link https://github.com/markocupic/contao-news-infinite-scroll-bundle
 */

namespace Markocupic\ContaoNewsInfiniteScrollBundle\DataContainer;

use Contao\BackendUser;
use Contao\CoreBundle\DataContainer\PaletteManipulator;
use Contao\CoreBundle\DependencyInjection\Attribute\AsCallback;
use Contao\DataContainer;
use Contao\Message;
use Contao\ModuleModel;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\Security;
use Symfony\Contracts\Translation\TranslatorInterface;

class Module
{
    public function __construct(
        private readonly Security $security,
        private readonly RequestStack $requestStack,
        private readonly TranslatorInterface $translator,
    ) {
    }

    /**
     * Show a hint if a JavaScript library needs to be included in the page layout.
     */
    #[AsCallback(table: 'tl_module', target: 'config.onload')]
    public function showJsLibraryHint(DataContainer $dc): void
    {
        $request = $this->requestStack->getCurrentRequest();

        if ($_POST || 'edit' !== $request->query->get('act')) {
            return;
        }

        $user = $this->security->getUser();

        if (!$user instanceof BackendUser) {
            return;
        }

        // Return if the user cannot access the layout module
        if (!$user->hasAccess('themes', 'modules') || !$user->hasAccess('layout', 'themes')) {
            return;
        }

        if (null === ($objModule = ModuleModel::findByPk($dc->id))) {
            return;
        }

        if ('newslist_infinite_scroll' === $objModule->type) {
            Message::addInfo(
                $this->translator->trans('tl_module.includeContaoNewsInfiniteScrollTemplate', ['js_news_infinite_scroll'], 'contao_default')
            );
        }
    }

    /**
     * Add DCA fields to palette.
     */
    #[AsCallback(table: 'tl_module', target: 'config.onload')]
    public function addFieldsToPalette(DataContainer $dc): void
    {
        if (null === ($objModule = ModuleModel::findByPk($dc->id))) {
            return;
        }

        if ('newslist_infinite_scroll' === $objModule->type) {
            // Manipulate palettes
            PaletteManipulator::create()
                ->addLegend('news_infinite_scroll_legend', 'protected_legend', PaletteManipulator::POSITION_BEFORE)
                ->addField(['newsInfiniteScroll_addCanonicalTag'], 'news_infinite_scroll_legend', PaletteManipulator::POSITION_APPEND)
                ->applyToPalette('newslist', 'tl_module')
            ;
        }
    }

    /**
     * Set the newslist_infinite_scroll palette as late as possible.
     */
    #[AsCallback(table: 'tl_module', target: 'config.onload')]
    public function setPalette(): void
    {
        $GLOBALS['TL_DCA']['tl_module']['palettes']['newslist_infinite_scroll'] = $GLOBALS['TL_DCA']['tl_module']['palettes']['newslist'];
    }
}
