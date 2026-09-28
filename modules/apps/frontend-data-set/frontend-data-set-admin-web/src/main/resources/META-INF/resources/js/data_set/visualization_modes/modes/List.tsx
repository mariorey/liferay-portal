/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayLayout from '@clayui/layout';
import {fetch} from 'frontend-js-web';
import React, {useEffect, useState} from 'react';

import {
	DEFAULT_FETCH_HEADERS,
	OBJECT_RELATIONSHIP,
} from '../../../utils/constants';
import getDataSetResourceURL from '../../../utils/getDataSetResourceURL';
import openDefaultFailureToast from '../../../utils/openDefaultFailureToast';
import openDefaultSuccessToast from '../../../utils/openDefaultSuccessToast';
import {IField, IFieldAssignment, IFieldTreeItem} from '../../../utils/types';
import {IDataSetSectionProps} from '../../DataSet';
import FieldAssignmentTable from '../components/FieldAssignmentTable';

interface IFDSListSection {
	externalReferenceCode: string;
	fieldName: string;
	id: string;
	name: string;
	rendererName?: string;
}
interface IListSection extends IFieldAssignment {
	externalReferenceCode?: IFDSListSection['externalReferenceCode'];
	fieldTreeItems: Array<IFieldTreeItem>;
	id?: IFDSListSection['id'];
	name: IFDSListSection['name'];
}

export default function List(props: IDataSetSectionProps) {
	const {dataSet, fieldTreeItems} = props;

	const [listSections, setListSections] = useState<Array<IListSection>>([
		{fieldTreeItems, label: Liferay.Language.get('title'), name: 'title'},
		{
			fieldTreeItems,
			label: Liferay.Language.get('description'),
			name: 'description',
		},
		{fieldTreeItems, label: Liferay.Language.get('image'), name: 'image'},
		{fieldTreeItems, label: Liferay.Language.get('symbol'), name: 'symbol'},
	]);
	const [saveButtonDisabled, setSaveButtonDisabled] = useState(false);

	const getFDSListSections = async () => {
		const url = getDataSetResourceURL({
			dataSetERC: dataSet.externalReferenceCode,
			relationship: OBJECT_RELATIONSHIP.DATA_SET_LIST_SECTIONS,
		});

		const response = await fetch(url, {
			headers: DEFAULT_FETCH_HEADERS,
		});

		if (!response.ok) {
			openDefaultFailureToast();

			return null;
		}

		const responseJSON = await response.json();

		const fdsListSections = responseJSON?.items;

		if (!fdsListSections) {
			openDefaultFailureToast();

			return null;
		}

		setListSections(
			listSections.map((listSection) => {
				const fdsListSection = fdsListSections.find(
					(fdsListSection: IFDSListSection) =>
						fdsListSection.name === listSection.name
				);

				if (!fdsListSection) {
					return {
						fieldTreeItems,
						label: listSection.label,
						name: listSection.name,
					};
				}

				return {
					...listSection,
					externalReferenceCode: fdsListSection.externalReferenceCode,
					field: {
						name: fdsListSection.fieldName,
					},
				};
			})
		);
	};

	const clearFDSListSection = async ({
		closeModal,
		listSection,
	}: {
		closeModal?: Function;
		listSection: IListSection;
	}) => {
		if (!listSection.externalReferenceCode) {
			if (closeModal) {
				closeModal();
			}

			return;
		}

		setSaveButtonDisabled(true);

		const url = getDataSetResourceURL({
			dataSetERC: dataSet.externalReferenceCode,
			relatedResourceERC: String(listSection.externalReferenceCode),
			relationship: OBJECT_RELATIONSHIP.DATA_SET_LIST_SECTIONS,
		});

		const response = await fetch(url, {method: 'DELETE'});

		setSaveButtonDisabled(false);

		if (!response.ok) {
			openDefaultFailureToast();

			return;
		}

		if (closeModal) {
			closeModal();
		}

		setListSections(
			listSections.map((section) => {
				if (section.name !== listSection.name) {
					return section;
				}

				const nextListSection = {...listSection};

				delete nextListSection.externalReferenceCode;
				delete nextListSection.field;

				return nextListSection;
			})
		);

		openDefaultSuccessToast();
	};

	const saveFDSListSection = async ({
		closeModal,
		field,
		listSection,
	}: {
		closeModal: Function;
		field: IField;
		listSection: IListSection;
	}) => {
		setSaveButtonDisabled(true);

		let method;
		let url;

		if (listSection.externalReferenceCode) {
			method = 'PATCH';

			url = getDataSetResourceURL({
				dataSetERC: dataSet.externalReferenceCode,
				relatedResourceERC: listSection.externalReferenceCode,
				relationship: OBJECT_RELATIONSHIP.DATA_SET_LIST_SECTIONS,
			});
		}
		else {
			method = 'POST';

			url = getDataSetResourceURL({
				dataSetERC: dataSet.externalReferenceCode,
				relationship: OBJECT_RELATIONSHIP.DATA_SET_LIST_SECTIONS,
			});
		}

		const response = await fetch(url, {
			body: JSON.stringify({
				fieldName: field.name,
				name: listSection.name,
			}),
			headers: DEFAULT_FETCH_HEADERS,
			method,
		});

		setSaveButtonDisabled(false);

		if (!response.ok) {
			openDefaultFailureToast();

			return;
		}

		const fdsListSection: IFDSListSection = await response.json();

		closeModal();

		setListSections(
			listSections.map((listSection) => {
				if (listSection.name !== fdsListSection.name) {
					return listSection;
				}

				return {
					...listSection,
					externalReferenceCode: fdsListSection.externalReferenceCode,
					field: {
						name: fdsListSection.fieldName,
					},
					id: fdsListSection.id,
				};
			})
		);

		openDefaultSuccessToast();
	};

	useEffect(() => {
		getFDSListSections();

		// eslint-disable-next-line react-compiler/react-compiler
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<ClayLayout.ContentCol className="c-gap-4">
			<FieldAssignmentTable
				emptyStateMessage={Liferay.Language.get(
					'this-visualization-mode-will-not-be-shown-until-you-assign-at-least-one-field-to-a-list-element'
				)}
				fieldAssignments={listSections}
				fieldTreeItems={fieldTreeItems}
				labelColumnHeader={Liferay.Language.get('list-element')}
				modalProps={props}
				onClearSelection={(listSection) =>
					clearFDSListSection({listSection})
				}
				onSelect={({closeModal, fieldAssignment, selectedField}) =>
					selectedField
						? saveFDSListSection({
								closeModal,
								field: selectedField,
								listSection: fieldAssignment,
							})
						: clearFDSListSection({
								closeModal,
								listSection: fieldAssignment,
							})
				}
				saveButtonDisabled={saveButtonDisabled}
			/>
		</ClayLayout.ContentCol>
	);
}
