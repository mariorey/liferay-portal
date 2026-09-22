/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {ClayToggle} from '@clayui/form';
import ClayLabel from '@clayui/label';
import ClayLayout from '@clayui/layout';
import {fetch, sub} from 'frontend-js-web';
import React, {useEffect, useState} from 'react';

import {
	DEFAULT_FETCH_HEADERS,
	OBJECT_RELATIONSHIP,
} from '../../../utils/constants';
import getDataSetResourceURL from '../../../utils/getDataSetResourceURL';
import openDefaultFailureToast from '../../../utils/openDefaultFailureToast';
import openDefaultSuccessToast from '../../../utils/openDefaultSuccessToast';
import {
	IClientExtensionVisualizationMode,
	IDataSet,
	IVisualizationModeClientExtension,
} from '../../../utils/types';

interface IClientExtensionVisualizationModesProps {
	dataSet: IDataSet;
	onEnabledModesChange?: () => void;
	visualizationModeClientExtensions: IVisualizationModeClientExtension[];
}

/**
 * Lists the visualization mode client extensions registered for the instance
 * and lets an administrator turn each one on for this data set.
 *
 * There is no field assignment here on purpose: a visualization mode client
 * extension reads the items itself and reports what it cannot use, so the only
 * thing this data set has to record is whether the mode is offered at all.
 */
export default function ClientExtensionVisualizationModes({
	dataSet,
	onEnabledModesChange,
	visualizationModeClientExtensions,
}: IClientExtensionVisualizationModesProps) {
	const [enabledModes, setEnabledModes] = useState<
		IClientExtensionVisualizationMode[]
	>([]);
	const [loading, setLoading] = useState(true);
	const [savingERC, setSavingERC] = useState<null | string>(null);

	const dataSetERC = dataSet.externalReferenceCode;

	useEffect(() => {
		const getEnabledModes = async () => {
			const response = await fetch(
				getDataSetResourceURL({
					dataSetERC,
					relationship:
						OBJECT_RELATIONSHIP.DATA_SET_VISUALIZATION_MODES,
				}),
				{headers: DEFAULT_FETCH_HEADERS}
			);

			if (!response.ok) {
				setLoading(false);

				return;
			}

			const responseJSON = await response.json();

			setEnabledModes(responseJSON.items ?? []);
			setLoading(false);
		};

		getEnabledModes();
	}, [dataSetERC]);

	const findEnabledMode = (externalReferenceCode: string) =>
		enabledModes.find(
			(enabledMode) =>
				enabledMode.clientExtensionEntryERC === externalReferenceCode
		);

	const toggleMode = async (
		visualizationModeClientExtension: IVisualizationModeClientExtension,
		enabled: boolean
	) => {
		const {externalReferenceCode, name} = visualizationModeClientExtension;

		setSavingERC(externalReferenceCode);

		const enabledMode = findEnabledMode(externalReferenceCode);

		const response = await fetch(
			getDataSetResourceURL({
				dataSetERC,
				relatedResourceERC: enabledMode?.externalReferenceCode,
				relationship: OBJECT_RELATIONSHIP.DATA_SET_VISUALIZATION_MODES,
			}),
			{
				body: JSON.stringify(
					enabledMode
						? {active: enabled}
						: {
								active: enabled,
								clientExtensionEntryERC: externalReferenceCode,
								label: name,
							}
				),
				headers: DEFAULT_FETCH_HEADERS,
				method: enabledMode ? 'PATCH' : 'POST',
			}
		);

		setSavingERC(null);

		if (!response.ok) {
			openDefaultFailureToast();

			return;
		}

		const responseJSON = await response.json();

		setEnabledModes((previousEnabledModes) =>
			enabledMode
				? previousEnabledModes.map((previousEnabledMode) =>
						previousEnabledMode.externalReferenceCode ===
						responseJSON.externalReferenceCode
							? responseJSON
							: previousEnabledMode
					)
				: [...previousEnabledModes, responseJSON]
		);

		openDefaultSuccessToast();

		onEnabledModesChange?.();
	};

	if (loading || !visualizationModeClientExtensions.length) {
		return null;
	}

	return (
		<ClayLayout.Row className="mt-4">
			<ClayLayout.Col size={12}>
				<h3 className="h4">
					{Liferay.Language.get(
						'client-extension-visualization-modes'
					)}
				</h3>

				<p className="text-secondary">
					{Liferay.Language.get(
						'turn-on-a-visualization-mode-client-extension-to-offer-it-in-this-data-sets-view-selector'
					)}
				</p>

				<ul className="list-group">
					{visualizationModeClientExtensions.map(
						(visualizationModeClientExtension) => {
							const {externalReferenceCode, name} =
								visualizationModeClientExtension;

							const enabledMode = findEnabledMode(
								externalReferenceCode
							);

							const enabled = Boolean(enabledMode?.active);

							return (
								<li
									className="list-group-item list-group-item-flex"
									key={externalReferenceCode}
								>
									<div className="autofit-col autofit-col-expand">
										<h4 className="list-group-title">
											{name}

											<ClayLabel
												className="ml-2"
												displayType="info"
											>
												{Liferay.Language.get(
													'client-extension'
												)}
											</ClayLabel>
										</h4>

										<p className="list-group-subtitle">
											{enabled
												? sub(
														Liferay.Language.get(
															'no-field-mapping-needed-here-x-discovers-and-validates-its-own-fields'
														),
														name
													)
												: externalReferenceCode}
										</p>
									</div>

									<div className="autofit-col">
										<ClayToggle
											aria-label={sub(
												Liferay.Language.get(
													'enable-x'
												),
												name
											)}
											disabled={
												savingERC ===
												externalReferenceCode
											}
											onToggle={(value: boolean) =>
												toggleMode(
													visualizationModeClientExtension,
													value
												)
											}
											toggled={enabled}
										/>
									</div>
								</li>
							);
						}
					)}
				</ul>
			</ClayLayout.Col>
		</ClayLayout.Row>
	);
}
