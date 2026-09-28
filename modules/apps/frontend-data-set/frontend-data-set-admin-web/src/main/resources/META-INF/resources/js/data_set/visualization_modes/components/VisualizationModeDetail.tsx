/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayBreadcrumb from '@clayui/breadcrumb';
import ClayLayout from '@clayui/layout';
import {sub} from 'frontend-js-web';
import React, {ComponentType} from 'react';

import {IVisualizationModeRow} from '../../../utils/types';
import {IDataSetSectionProps} from '../../DataSet';
import Cards from '../modes/Cards';
import List from '../modes/List';
import Table from '../modes/Table';
import ClientExtensionFieldMapping from './ClientExtensionFieldMapping';

const BUILT_IN_MODE_COMPONENTS: {
	[key: string]: ComponentType<IDataSetSectionProps>;
} = {
	cards: Cards,
	list: List,
	table: Table,
};

interface IVisualizationModeDetailProps extends IDataSetSectionProps {
	fieldMapping?: string;
	onBack: () => void;
	onFieldMappingSave: (fieldMapping: string) => Promise<void>;
	visualizationMode: IVisualizationModeRow;
}

/**
 * What a single visualization mode has to configure. A built in mode brings the
 * field assignment it always had; a client extension brings a form only when it
 * declared a schema, because otherwise it works the fields out for itself.
 */
export default function VisualizationModeDetail({
	fieldMapping,
	onBack,
	onFieldMappingSave,
	visualizationMode,
	...props
}: IVisualizationModeDetailProps) {
	const BuiltInComponent =
		BUILT_IN_MODE_COMPONENTS[visualizationMode.externalReferenceCode];

	return (
		<ClayLayout.ContainerFluid className="mt-3 visualization-modes">
			<ClayLayout.Sheet>
				<ClayBreadcrumb
					items={[
						{
							label: Liferay.Language.get('visualization-modes'),
							onClick: onBack,
						},
						{
							active: true,
							label: visualizationMode.label,
						},
					]}
				/>

				<ClayLayout.SheetHeader className="mb-4">
					<h2 className="mb-0">{visualizationMode.label}</h2>
				</ClayLayout.SheetHeader>

				{BuiltInComponent ? (
					<BuiltInComponent {...props} />
				) : visualizationMode.schemaURL ? (
					<ClientExtensionFieldMapping
						fieldMapping={fieldMapping}
						fieldTreeItems={props.fieldTreeItems}
						modalProps={props}
						onSave={onFieldMappingSave}
						visualizationMode={visualizationMode}
					/>
				) : (
					<p className="text-secondary">
						{sub(
							Liferay.Language.get(
								'no-field-mapping-needed-here-x-discovers-and-validates-its-own-fields'
							),
							visualizationMode.label
						)}
					</p>
				)}
			</ClayLayout.Sheet>
		</ClayLayout.ContainerFluid>
	);
}
