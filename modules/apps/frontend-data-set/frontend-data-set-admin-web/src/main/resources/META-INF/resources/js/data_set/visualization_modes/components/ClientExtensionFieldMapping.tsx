/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayLayout from '@clayui/layout';
import ClayLoadingIndicator from '@clayui/loading-indicator';
import {sub} from 'frontend-js-web';
import React, {useEffect, useState} from 'react';

import {
	IField,
	IFieldAssignment,
	IFieldTreeItem,
	IVisualizationModeRow,
	IVisualizationModeSchemaField,
} from '../../../utils/types';
import {IDataSetSectionProps} from '../../DataSet';
import FieldAssignmentTable from './FieldAssignmentTable';

interface IClientExtensionFieldMappingProps {
	fieldMapping?: string;
	fieldTreeItems: Array<IFieldTreeItem>;
	modalProps: IDataSetSectionProps;
	onSave: (fieldMapping: string) => Promise<void>;
	visualizationMode: IVisualizationModeRow;
}

/**
 * A tree item carries its own fully qualified name, so finding the field an
 * assignment points at is a walk rather than a join.
 */
function findField(
	fieldTreeItems: Array<IFieldTreeItem>,
	name: string
): IField | undefined {
	for (const fieldTreeItem of fieldTreeItems) {
		if (fieldTreeItem.name === name) {
			return fieldTreeItem;
		}

		const field = findField(fieldTreeItem.children ?? [], name);

		if (field) {
			return field;
		}
	}

	return undefined;
}

/**
 * The field mapping a visualization mode client extension asks for by
 * declaring a schema. What the schema names becomes the rows of the same
 * assignment table the built in modes use, so an administrator maps a kanban
 * board exactly the way they map a card.
 */
export default function ClientExtensionFieldMapping({
	fieldMapping,
	fieldTreeItems,
	modalProps,
	onSave,
	visualizationMode,
}: IClientExtensionFieldMappingProps) {
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(true);
	const [saveButtonDisabled, setSaveButtonDisabled] = useState(false);
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

	/**
	 * A mapping is saved the moment a field is picked, the way a built in mode
	 * saves its own assignment, so there is no second step to forget.
	 */
	const save = async (
		closeModal: Function | undefined,
		name: string,
		fieldName: string | undefined
	) => {
		const nextSelections = {...selections};

		if (fieldName) {
			nextSelections[name] = fieldName;
		}
		else {
			delete nextSelections[name];
		}

		setSaveButtonDisabled(true);

		await onSave(JSON.stringify(nextSelections));

		setSaveButtonDisabled(false);
		setSelections(nextSelections);

		if (closeModal) {
			closeModal();
		}
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

	const fieldAssignments: Array<IFieldAssignment> = schemaFields.map(
		(schemaField) => {
			const fieldName = selections[schemaField.name];

			return {
				description: schemaField.description,
				field: fieldName
					? findField(fieldTreeItems, fieldName) ?? {name: fieldName}
					: undefined,
				label: schemaField.label || schemaField.name,
				name: schemaField.name,
				required: schemaField.required,
			};
		}
	);

	return (
		<ClayLayout.ContentCol className="c-gap-4">
			<FieldAssignmentTable
				emptyStateMessage={sub(
					Liferay.Language.get(
						'x-declares-the-fields-below-pick-what-this-data-set-holds-for-each-of-them'
					),
					visualizationMode.label
				)}
				fieldAssignments={fieldAssignments}
				fieldTreeItems={fieldTreeItems}
				labelColumnHeader={Liferay.Language.get('schema-field')}
				modalProps={modalProps}
				onClearSelection={(fieldAssignment) =>
					save(undefined, fieldAssignment.name, undefined)
				}
				onSelect={({closeModal, fieldAssignment, selectedField}) =>
					save(closeModal, fieldAssignment.name, selectedField?.name)
				}
				saveButtonDisabled={saveButtonDisabled}
			/>
		</ClayLayout.ContentCol>
	);
}
