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

namespace Markocupic\ContaoNewsInfiniteScrollBundle\Module;

use Contao\BackendTemplate;
use Contao\CoreBundle\Exception\ResponseException;
use Contao\Environment;
use Contao\Input;
use Contao\ModuleNewsList;
use Contao\PageModel;
use Contao\StringUtil;
use Contao\System;
use Symfony\Component\HttpFoundation\JsonResponse;

class ModuleNewslistInfiniteScroll extends ModuleNewsList
{
    public const TYPE = 'newslist_infinite_scroll';

    public const AJAX_TEMPLATE = '_mod_newslist_infinite_scroll_ajax';

    /**
     * Default template (can be overridden via the "customTpl" field).
     *
     * @var string
     */
    protected $strTemplate = 'mod_newslist_inf_scroll';

    /**
     * Display a wildcard in the back end.
     */
    public function generate(): string
    {
        $container = System::getContainer();
        $request = $container->get('request_stack')->getCurrentRequest();

        if ($request && $container->get('contao.routing.scope_matcher')->isBackendRequest($request)) {
            $objTemplate = new BackendTemplate('be_wildcard');
            $objTemplate->wildcard = '### '.($GLOBALS['TL_LANG']['FMD'][self::TYPE][0] ?? self::TYPE).' ###';
            $objTemplate->title = $this->headline;
            $objTemplate->id = $this->id;
            $objTemplate->link = $this->name;
            $objTemplate->href = StringUtil::specialcharsUrl($container->get('router')->generate('contao_backend', ['do' => 'themes', 'table' => 'tl_module', 'act' => 'edit', 'id' => $this->id]));

            return $objTemplate->parse();
        }

        if ($this->isAjaxRequest()) {
            // Do not add the page to the search index on ajax calls
            if (($page = $GLOBALS['objPage'] ?? null) instanceof PageModel) {
                $page->noSearch = true;
            }

            // Send the articles without the module wrapper to the browser
            $this->strTemplate = self::AJAX_TEMPLATE;
        }

        return parent::generate();
    }

    /**
     * Generate the module.
     */
    protected function compile(): void
    {
        parent::compile();

        if ($this->isAjaxRequest()) {
            $this->Template->headline = '';
            $this->Template->pagination = '';

            $json = [
                'status' => 'success',
                'uri' => Environment::get('uri'),
                'data' => $this->Template->getResponse(true, true)->getContent(),
            ];

            throw new ResponseException(new JsonResponse($json));
        }
    }

    /**
     * Checks whether the request is an AJAX request for this module.
     */
    private function isAjaxRequest(): bool
    {
        return Environment::get('isAjaxRequest') && null !== Input::get('page_n'.$this->id) && null !== Input::get('ajaxCall');
    }
}
