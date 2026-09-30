/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import ClayIcon from '@clayui/icon';
import ClayLabel from '@clayui/label';
import ClayLayout from '@clayui/layout';
import {fetch, sub} from 'frontend-js-web';
import React, {useCallback, useEffect, useState} from 'react';

import OrderableTable from '../../components/OrderableTable';
import Toggle from '../../components/Toggle';
import {
	DEFAULT_FETCH_HEADERS,
	DEFAULT_VISUALIZATION_MODES,
	OBJECT_RELATIONSHIP,
} from '../../utils/constants';
import getDataSetResourceURL from '../../utils/getDataSetResourceURL';
import openDefaultFailureToast from '../../utils/openDefaultFailureToast';
import openDefaultSuccessToast from '../../utils/openDefaultSuccessToast';
import {
	IClientExtensionVisualizationMode,
	IVisualizationModeClientExtension,
	IVisualizationModeRow,
} from '../../utils/types';
import {IDataSetSectionProps} from '../DataSet';
import VisualizationModeDetail from './components/VisualizationModeDetail';

/**
 * Every visualization mode a data set can offer, built in and client extension
 * alike, in one orderable table. A row carries whether the mode is offered and
 * where it sits in the view selector; opening it leads to whatever that mode
 * has to configure.
 */
export default function VisualizationModes(props: IDataSetSectionProps) {
	const {dataSet, visualizationModeClientExtensions = []} = props;

	const dataSetERC = dataSet.externalReferenceCode;

	const [enabledModes, setEnabledModes] = useState<
		IClientExtensionVisualizationMode[]
	>([]);
	const [loading, setLoading] = useState(true);
	const [order, setOrder] = useState<string[]>([]);
	const [savingModeId, setSavingModeId] = useState<null | string>(null);
	const [selectedModeId, setSelectedModeId] = useState<null | string>(null);

	const loadState = useCallback(async () => {
		const [modesResponse, dataSetResponse] = await Promise.all([
			fetch(
				getDataSetResourceURL({
					dataSetERC,
					relationship:
						OBJECT_RELATIONSHIP.DATA_SET_VISUALIZATION_MODES,
				}),
				{headers: DEFAULT_FETCH_HEADERS}
			),
			fetch(getDataSetResourceURL({dataSetERC}), {
				headers: DEFAULT_FETCH_HEADERS,
			}),
		]);

		if (modesResponse.ok) {
			const modesJSON = await modesResponse.json();

			setEnabledModes(modesJSON.items ?? []);
		}

		if (dataSetResponse.ok) {
			const dataSetJSON = await dataSetResponse.json();

			setOrder(
				(dataSetJSON.visualizationModesOrder || '')
					.split(',')
					.filter(Boolean)
			);
		}

		setLoading(false);
	}, [dataSetERC]);

	useEffect(() => {
		loadState();
	}, [loadState]);

	const findEnabledMode = (modeId: string) =>
		enabledModes.find(
			(enabledMode) => enabledMode.clientExtensionEntryERC === modeId
		);

	// A built in mode with no row of its own is offered, so that a data set
	// configured before this table existed keeps working as it did.

	const rows: IVisualizationModeRow[] = [
		...DEFAULT_VISUALIZATION_MODES.map((visualizationMode) => ({
			active: findEnabledMode(visualizationMode.mode)?.active ?? true,
			clientExtension: false,
			externalReferenceCode: visualizationMode.mode,
			label: visualizationMode.label,
			schemaURL: '',
			thumbnail: visualizationMode.thumbnail,
		})),
		...visualizationModeClientExtensions.map(
			(clientExtension: IVisualizationModeClientExtension) => ({
				active:
					findEnabledMode(clientExtension.externalReferenceCode)
						?.active ?? false,
				clientExtension: true,
				externalReferenceCode: clientExtension.externalReferenceCode,
				label: clientExtension.name,
				schemaURL: clientExtension.schemaURL ?? '',
				thumbnail: clientExtension.thumbnail || 'cards2',
			})
		),
	].sort((a, b) => {
		const indexA = order.indexOf(a.externalReferenceCode);
		const indexB = order.indexOf(b.externalReferenceCode);

		return (
			(indexA === -1 ? order.length : indexA) -
			(indexB === -1 ? order.length : indexB)
		);
	});

	/**
	 * A mode keeps one row per data set, created the first time anything about
	 * it is configured, so turning it on and mapping its fields write to the
	 * same place.
	 */
	const saveVisualizationMode = async (
		row: IVisualizationModeRow,
		changes: {active?: boolean; fieldMapping?: string}
	) => {
		const modeId = row.externalReferenceCode;

		setSavingModeId(modeId);

		const enabledMode = findEnabledMode(modeId);

		const response = await fetch(
			getDataSetResourceURL({
				dataSetERC,
				relatedResourceERC: enabledMode?.externalReferenceCode,
				relationship: OBJECT_RELATIONSHIP.DATA_SET_VISUALIZATION_MODES,
			}),
			{
				body: JSON.stringify(
					enabledMode
						? changes
						: {
								active: row.active,
								clientExtensionEntryERC: modeId,
								label: row.label,
								...changes,
							}
				),
				headers: DEFAULT_FETCH_HEADERS,
				method: enabledMode ? 'PATCH' : 'POST',
			}
		);

		setSavingModeId(null);

		if (!response.ok) {
			openDefaultFailureToast();

			return;
		}

		const responseJSON = await response.json();

		setEnabledModes((previous) =>
			enabledMode
				? previous.map((mode) =>
						mode.externalReferenceCode ===
						responseJSON.externalReferenceCode
							? responseJSON
							: mode
					)
				: [...previous, responseJSON]
		);

		openDefaultSuccessToast();
	};

	const toggleMode = (row: IVisualizationModeRow) =>
		saveVisualizationMode(row, {active: !row.active});

	const saveOrder = async (newOrder: string) => {
		const response = await fetch(getDataSetResourceURL({dataSetERC}), {
			body: JSON.stringify({visualizationModesOrder: newOrder}),
			headers: DEFAULT_FETCH_HEADERS,
			method: 'PATCH',
		});

		if (!response.ok) {
			openDefaultFailureToast();

			return;
		}

		setOrder(newOrder.split(',').filter(Boolean));

		openDefaultSuccessToast();
	};

	if (loading) {
		return null;
	}

	const selectedRow = rows.find(
		(row) => row.externalReferenceCode === selectedModeId
	);

	if (selectedRow) {
		return (
			<VisualizationModeDetail
				{...props}
				fieldMapping={
					findEnabledMode(selectedRow.externalReferenceCode)
						?.fieldMapping
				}
				onBack={() => setSelectedModeId(null)}
				onFieldMappingSave={(fieldMapping: string) =>
					saveVisualizationMode(selectedRow, {fieldMapping})
				}
				visualizationMode={selectedRow}
			/>
		);
	}

	return (
		<ClayLayout.ContainerFluid className="mt-3 visualization-modes">
			<ClayLayout.Sheet>
				<ClayLayout.SheetHeader className="mb-4">
					<h2 className="mb-0">
						{Liferay.Language.get('visualization-modes')}
					</h2>

					<p className="mb-0 text-secondary">
						{Liferay.Language.get(
							'drag-to-order-the-visualization-modes-of-this-data-set-and-open-one-to-configure-it'
						)}
					</p>
				</ClayLayout.SheetHeader>

				<OrderableTable
					className="mt-0 p-1"
					fields={[
						{
							contentRenderer: {
								component: ({item}: any) => (
									<ClayIcon symbol={item.thumbnail} />
								),
							},
							label: Liferay.Language.get('icon'),
							name: 'thumbnail',
						},
						{
							label: Liferay.Language.get('label'),
							name: 'label',
						},
						{
							contentRenderer: {
								component: ({item}: any) =>
									item.clientExtension ? (
										<ClayLabel displayType="info">
											{Liferay.Language.get(
												'client-extension'
											)}
										</ClayLabel>
									) : (
										<span>
											{Liferay.Language.get('built-in')}
										</span>
									),
								textMatch: (item: any) =>
									item.clientExtension
										? Liferay.Language.get(
												'client-extension'
											)
										: Liferay.Language.get('built-in'),
							},
							label: Liferay.Language.get('type'),
							name: 'clientExtension',
						},
						{
							contentRenderer: {
								component: ({item}: any) =>
									Toggle({
										disabled:
											savingModeId ===
											item.externalReferenceCode,
										item,
										toggleChange: toggleMode,
									}),
							},
							label: Liferay.Language.get('status'),
							name: 'active',
						},
						{

							// Opening a row by clicking it is quick but
							// invisible, so the same thing is spelled out as a
							// button that a keyboard and a screen reader can
							// find.

							contentRenderer: {
								component: ({item}: any) => (
									<ClayButton
										aria-label={sub(
											Liferay.Language.get('edit-x'),
											item.label
										)}
										displayType="secondary"
										onClick={() =>
											setSelectedModeId(
												item.externalReferenceCode
											)
										}
										size="sm"
									>
										{Liferay.Language.get('edit')}
									</ClayButton>
								),
								textMatch: () => '',
							},
							label: '',
							name: 'edit',
						},
					]}
					items={rows}
					noItemsButtonLabel=""
					noItemsDescription={Liferay.Language.get(
						'a-data-set-offers-no-visualization-mode-until-one-is-turned-on'
					)}
					noItemsTitle={Liferay.Language.get(
						'no-visualization-modes-were-found'
					)}
					onOrderChange={({order}: {order: string}) =>
						saveOrder(order)
					}
					onRowClick={(row: IVisualizationModeRow) =>
						setSelectedModeId(row.externalReferenceCode)
					}
				/>
			</ClayLayout.Sheet>
		</ClayLayout.ContainerFluid>
	);
}
