/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import {ClayInput, ClaySelect} from '@clayui/form';
import ClayLoadingIndicator from '@clayui/loading-indicator';
import {sub} from 'frontend-js-web';
import React, {useEffect, useState} from 'react';

import {
	IFieldTreeItem,
	IVisualizationModeRow,
	IVisualizationModeSchemaField,
} from '../../../utils/types';

interface IClientExtensionFieldMappingProps {
	fieldMapping?: string;
	fieldTreeItems: Array<IFieldTreeItem>;
	onSave: (fieldMapping: string) => Promise<void>;
	visualizationMode: IVisualizationModeRow;
}

/**
 * A tree item already carries its fully qualified name, so flattening is a
 * walk rather than a join. Only the leaves are mappable: a branch stands for a
 * nested object, and a visualization mode asks for a value.
 */
function flattenFields(
	fieldTreeItems: Array<IFieldTreeItem>
): Array<{label: string; name: string}> {
	return fieldTreeItems.flatMap((fieldTreeItem) =>
		fieldTreeItem.children?.length
			? flattenFields(fieldTreeItem.children)
			: [
					{
						label: fieldTreeItem.label || fieldTreeItem.name,
						name: fieldTreeItem.name,
					},
				]
	);
}

/**
 * The field mapping form a visualization mode client extension asks for by
 * declaring a schema. What the schema names is what the mode expects; what the
 * administrator picks against it is what this data set holds.
 */
export default function ClientExtensionFieldMapping({
	fieldMapping,
	fieldTreeItems,
	onSave,
	visualizationMode,
}: IClientExtensionFieldMappingProps) {
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [schemaFields, setSchemaFields] = useState<
		Array<IVisualizationModeSchemaField>
	>([]);
	const [selections, setSelections] = useState<Record<string, string>>({});

	const {schemaURL} = visualizationMode;

	useEffect(() => {
		let abandoned = false;

		const loadSchema = async () => {
			try {

				// @ts-ignore

				const module = await import(

					/* webpackIgnore: true */ schemaURL
				);

				if (abandoned) {
					return;
				}

				const schema = module.default ?? module;

				setSchemaFields(schema?.fields ?? []);
			}
			catch (loadError) {
				if (!abandoned) {
					setError(String(loadError));
				}
			}
			finally {
				if (!abandoned) {
					setLoading(false);
				}
			}
		};

		loadSchema();

		return () => {
			abandoned = true;
		};
	}, [schemaURL]);

	useEffect(() => {
		try {
			setSelections(fieldMapping ? JSON.parse(fieldMapping) : {});
		}
		catch (parseError) {
			setSelections({});
		}
	}, [fieldMapping]);

	const save = async () => {
		setSaving(true);

		await onSave(JSON.stringify(selections));

		setSaving(false);
	};

	if (loading) {
		return <ClayLoadingIndicator className="my-7" />;
	}

	if (error || !schemaFields.length) {
		return (
			<p className="text-secondary">
				{sub(
					Liferay.Language.get(
						'the-schema-of-x-could-not-be-read-so-there-is-nothing-to-map'
					),
					visualizationMode.label
				)}
			</p>
		);
	}

	const dataSetFields = flattenFields(fieldTreeItems);

	return (
		<>
			<p className="text-secondary">
				{sub(
					Liferay.Language.get(
						'x-declares-the-fields-below-pick-what-this-data-set-holds-for-each-of-them'
					),
					visualizationMode.label
				)}
			</p>

			{schemaFields.map((schemaField) => (
				<ClayInput.Group key={schemaField.name} stacked>
					<ClayInput.GroupItem>
						<label htmlFor={`mapping-${schemaField.name}`}>
							{schemaField.label || schemaField.name}

							{schemaField.required && (
								<span className="ml-1 reference-mark text-warning">
									*
								</span>
							)}
						</label>

						<ClaySelect
							aria-label={schemaField.label || schemaField.name}
							id={`mapping-${schemaField.name}`}
							onChange={(event) =>
								setSelections({
									...selections,
									[schemaField.name]: event.target.value,
								})
							}
							value={selections[schemaField.name] ?? ''}
						>
							<ClaySelect.Option
								label={Liferay.Language.get('not-mapped')}
								value=""
							/>

							{dataSetFields.map((dataSetField) => (
								<ClaySelect.Option
									key={dataSetField.name}
									label={`${dataSetField.label} (${dataSetField.name})`}
									value={dataSetField.name}
								/>
							))}
						</ClaySelect>

						{schemaField.description && (
							<p className="form-text">
								{schemaField.description}
							</p>
						)}
					</ClayInput.GroupItem>
				</ClayInput.Group>
			))}

			<ClayButton disabled={saving} onClick={save}>
				{Liferay.Language.get('save')}
			</ClayButton>
		</>
	);
}
