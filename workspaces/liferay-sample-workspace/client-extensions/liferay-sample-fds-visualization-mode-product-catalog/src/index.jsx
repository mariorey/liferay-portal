/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React, {useContext} from 'react';

import ActionsMenu from './ActionsMenu';
import {
	getFirstValue,
	getItemActions,
	injectStyleSheet,
	runItemAction,
	toText,
} from './fds';
import styles from './styles';

/**
 * LPD-43793 — Rich product catalog visualization mode.
 *
 * Richer than the out-of-the-box Cards mode: product image, price with a
 * struck-through list price, stock signal, rating and a quick "Add to cart"
 * action. The data set still owns everything underneath — this component never
 * fetches, searches, sorts or paginates. Type in the data set search box and
 * the grid narrows; use the pagination bar and the grid pages.
 *
 * Inspired by the Minium / Commerce catalog case named in the discovery doc.
 */

/**
 * PROVISIONAL: field names are discovered from the item rather than configured.
 * The real visualization mode gets an explicit mapping from the Data Set
 * Manager (LPD-9599).
 */
const FIELDS = {
	category: ['category', 'productType', 'collection', 'brand'],
	currency: ['currency', 'currencyCode'],
	imageURL: ['imageURL', 'image', 'thumbnail', 'pictureURL'],
	listPrice: ['listPrice', 'originalPrice', 'compareAtPrice'],
	price: ['price', 'finalPrice', 'unitPrice'],
	rating: ['rating', 'score', 'averageRating'],
	ratingCount: ['ratingCount', 'reviewCount', 'reviews'],
	sku: ['sku', 'externalReferenceCode', 'code'],
	stockQuantity: ['stockQuantity', 'availableQuantity', 'inventory'],
	stockStatus: ['stockStatus', 'availability'],
	title: ['name', 'title', 'label'],
};

const LOW_STOCK_THRESHOLD = 10;

injectStyleSheet('fds-catalog-styles', styles);

export default function ProductCatalog({
	frontendDataSetContext,
	items = [],
	itemsActions,
}) {
	const fdsContext = useContext(frontendDataSetContext);

	return (
		<div className="fds-catalog">
			{items.map((item, index) => (
				<ProductCard
					fdsContext={fdsContext}
					item={item}
					itemsActions={itemsActions}
					key={item.id ?? item.externalReferenceCode ?? index}
				/>
			))}
		</div>
	);
}

function ProductCard({fdsContext, item, itemsActions}) {
	const actions = getItemActions({item, itemsActions});

	const title = toText(getFirstValue(item, FIELDS.title)) || '(unnamed product)';
	const category = toText(getFirstValue(item, FIELDS.category));
	const imageURL = toText(getFirstValue(item, FIELDS.imageURL));
	const sku = toText(getFirstValue(item, FIELDS.sku));
	const price = toNumber(getFirstValue(item, FIELDS.price));
	const listPrice = toNumber(getFirstValue(item, FIELDS.listPrice));
	const currency = toText(getFirstValue(item, FIELDS.currency)) || 'EUR';
	const rating = toNumber(getFirstValue(item, FIELDS.rating));
	const ratingCount = toNumber(getFirstValue(item, FIELDS.ratingCount));

	const stock = resolveStock(item);

	const discount =
		listPrice && price && listPrice > price
			? Math.round(((listPrice - price) / listPrice) * 100)
			: 0;

	// The quick action reuses whatever the data set declared. Matching on the
	// label keeps the demo honest: nothing is invented client side.

	const quickAction =
		actions.find((action) => /cart|buy|order/i.test(action.label ?? '')) ??
		actions[0];

	return (
		<article className="fds-catalog__card">
			<div className="fds-catalog__card-actions">
				<ActionsMenu
					actions={actions}
					fdsContext={fdsContext}
					item={item}
					label={`Actions for ${title}`}
				/>
			</div>

			<div className="fds-catalog__media">
				{imageURL ? (
					<img alt="" loading="lazy" src={imageURL} />
				) : (
					<span className="fds-catalog__media-fallback">
						{title.charAt(0).toUpperCase()}
					</span>
				)}

				<div className="fds-catalog__badges">
					{discount > 0 && (
						<span className="fds-catalog__badge fds-catalog__badge--discount">
							{`-${discount}%`}
						</span>
					)}
				</div>
			</div>

			<div className="fds-catalog__body">
				{category && (
					<span className="fds-catalog__eyebrow">{category}</span>
				)}

				<h4 className="fds-catalog__title">{title}</h4>

				{rating ? (
					<span className="fds-catalog__rating">
						<span className="fds-catalog__stars">
							{stars(rating)}
						</span>

						{rating.toFixed(1)}

						{ratingCount ? ` (${ratingCount})` : null}
					</span>
				) : null}

				<div className="fds-catalog__price-row">
					<span className="fds-catalog__price">
						{formatPrice(price, currency)}
					</span>

					{discount > 0 && (
						<span className="fds-catalog__price-was">
							{formatPrice(listPrice, currency)}
						</span>
					)}
				</div>

				<span
					className={`fds-catalog__stock fds-catalog__stock--${stock.level}`}
				>
					<span className="fds-catalog__stock-dot" />

					{stock.label}
				</span>

				{sku && <span className="fds-catalog__eyebrow">{sku}</span>}

				<div className="fds-catalog__footer">
					<button
						className="fds-catalog__cta"
						disabled={stock.level === 'out' || !quickAction}
						onClick={(event) => {
							event.stopPropagation();

							runItemAction({
								action: quickAction,
								event,
								fdsContext,
								item,
							});
						}}
						type="button"
					>
						{stock.level === 'out'
							? 'Out of stock'
							: toText(quickAction?.label) || 'View'}
					</button>
				</div>
			</div>
		</article>
	);
}

function resolveStock(item) {
	const status = toText(getFirstValue(item, FIELDS.stockStatus));
	const quantity = toNumber(getFirstValue(item, FIELDS.stockQuantity));

	if (/out/i.test(status) || quantity === 0) {
		return {label: 'Out of stock', level: 'out'};
	}

	if (/low|backorder/i.test(status)) {
		return {
			label: quantity ? `Only ${quantity} left` : 'Low stock',
			level: 'low',
		};
	}

	if (quantity && quantity <= LOW_STOCK_THRESHOLD) {
		return {label: `Only ${quantity} left`, level: 'low'};
	}

	return {label: status || 'In stock', level: 'in'};
}

function formatPrice(value, currency) {
	if (value === undefined || value === null || Number.isNaN(value)) {
		return '—';
	}

	try {
		return new Intl.NumberFormat(undefined, {
			currency,
			style: 'currency',
		}).format(value);
	}
	catch (error) {
		return `${value} ${currency}`;
	}
}

function stars(rating) {
	const rounded = Math.round(rating);

	return '★★★★★'.slice(0, rounded) + '☆☆☆☆☆'.slice(0, 5 - rounded);
}

function toNumber(value) {
	if (value === undefined || value === null || value === '') {
		return undefined;
	}

	const number = Number(value);

	return Number.isNaN(number) ? undefined : number;
}
