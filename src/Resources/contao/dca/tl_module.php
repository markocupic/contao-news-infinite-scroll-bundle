<?php

/*
 * This file is part of Resource Booking Bundle.
 *
 * (c) Marko Cupic 2021 <m.cupic@gmx.ch>
 * @license MIT
 * @link https://github.com/markocupic/contao-news-infinite-scroll-bundle
 */

use Contao\Backend;
use Contao\CoreBundle\DataContainer\PaletteManipulator;
use Contao\Message;
use Contao\ModuleModel;
use Contao\Input;

// Onload callbacks (keep this order!)
$GLOBALS['TL_DCA']['tl_module']['config']['onload_callback'][] = array('tl_module_contao_news_infinite_scroll', 'showJsLibraryHint');
$GLOBALS['TL_DCA']['tl_module']['config']['onload_callback'][] = array('tl_module_contao_news_infinite_scroll', 'addFieldsToPalette');
$GLOBALS['TL_DCA']['tl_module']['config']['onload_callback'][] = array('tl_module_contao_news_infinite_scroll', 'setPalette');

// Fields
$GLOBALS['TL_DCA']['tl_module']['fields']['newsInfiniteScroll_addCanonicalTag'] = array(
	'label'     => &$GLOBALS['TL_LANG']['tl_module']['newsInfiniteScroll_addCanonicalTag'],
	'exclude'   => true,
	'inputType' => 'checkbox',
	'eval'      => array('tl_class' => 'w50'),
	'sql'       => "char(1) NOT NULL default ''"
);

/**
 * Class tl_module_contao_news_infinite_scroll
 * Provide miscellaneous methods that are used by the data configuration array.
 */
class tl_module_contao_news_infinite_scroll extends Backend
{
	/**
	 * Import the back end user object
	 */
	public function __construct()
	{
		parent::__construct();
		$this->import('BackendUser', 'User');
	}

	/**
	 * Show a hint if a JavaScript library needs to be included in the page layout
	 *
	 * @param object $dc
	 */
	public function showJsLibraryHint($dc)
	{
		if ($_POST || Input::get('act') != 'edit')
		{
			return;
		}

		// Return if the user cannot access the layout module (see #6190)
		if (!$this->User->hasAccess('themes', 'modules') || !$this->User->hasAccess('layout', 'themes'))
		{
			return;
		}

		$objMod = ModuleModel::findByPk($dc->id);

		if ($objMod === null)
		{
			return;
		}

		if ($objMod->type === 'newslist_infinite_scroll')
		{
			Message::addInfo(sprintf($GLOBALS['TL_LANG']['tl_module']['includeContaoNewsInfiniteScrollTemplate'], 'j_news_infinite_scroll'));
		}
	}

	/**
	 * Add dca fields to palette
	 *
	 * @param $dc
	 */
	public function addFieldsToPalette($dc)
	{
		$objMod = ModuleModel::findByPk($dc->id);

		if ($objMod === null)
		{
			return;
		}

		if ($objMod->type === 'newslist_infinite_scroll')
		{
			// Manipulate palettes
			PaletteManipulator::create()
				->addLegend('news_infinite_scroll_legend', 'protected_legend', PaletteManipulator::POSITION_BEFORE)
				->addField(array('newsInfiniteScroll_addCanonicalTag'), 'news_infinite_scroll_legend', PaletteManipulator::POSITION_APPEND)
				->applyToPalette('newslist', 'tl_module');
		}
	}

	/**
	 * Sets the newslist_infinite_scroll palette as late as possible.
	 */
	public function setPalette()
	{
		$GLOBALS['TL_DCA']['tl_module']['palettes']['newslist_infinite_scroll'] = $GLOBALS['TL_DCA']['tl_module']['palettes']['newslist'];
	}
}
