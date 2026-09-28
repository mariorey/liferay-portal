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

interface IFDSCardsSection {
	externalReferenceCode: string;
	fieldName: string;
	id: string;
	name: string;
	rendererName?: string;
}
interface ICardsSection extends IFieldAssignment {
	externalReferenceCode?: IFDSCardsSection['externalReferenceCode'];
	fieldTreeItems: Array<IFieldTreeItem>;
	id?: IFDSCardsSection['id'];
	name: IFDSCardsSection['name'];
}

export default function Cards(props: IDataSetSectionProps) {
	const {dataSet, fieldTreeItems} = props;

	const [cardsSections, setCardsSections] = useState<Array<ICardsSection>>([
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

	const getFDSCardsSections = async () => {
		const url = getDataSetResourceURL({
			dataSetERC: dataSet.externalReferenceCode,
			relationship: OBJECT_RELATIONSHIP.DATA_SET_CARDS_SECTIONS,
		});

		const response = await fetch(url, {headers: DEFAULT_FETCH_HEADERS});

		if (!response.ok) {
			openDefaultFailureToast();

			return null;
		}

		const responseJSON = await response.json();

		const fdsCardsSections = responseJSON?.items;

		if (!fdsCardsSections) {
			openDefaultFailureToast();

			return null;
		}

		setCardsSections(
			cardsSections.map((cardsSection) => {
				const fdsCardsSection = fdsCardsSections.find(
					(fdsCardsSection: IFDSCardsSection) =>
						fdsCardsSection.name === cardsSection.name
				);

				if (!fdsCardsSection) {
					return {
						fieldTreeItems,
						label: cardsSection.label,
						name: cardsSection.name,
					};
				}

				return {
					...cardsSection,
					externalReferenceCode:
						fdsCardsSection.externalReferenceCode,
					field: {
						name: fdsCardsSection.fieldName,
					},
					id: fdsCardsSection.id,
				};
			})
		);
	};

	const clearFDSCardSection = async ({
		cardsSection,
		closeModal,
	}: {
		cardsSection: ICardsSection;
		closeModal?: Function;
	}) => {
		if (!cardsSection.externalReferenceCode) {
			if (closeModal) {
				closeModal();
			}

			return;
		}

		setSaveButtonDisabled(true);

		const url = getDataSetResourceURL({
			dataSetERC: dataSet.externalReferenceCode,
			relatedResourceERC: String(cardsSection.externalReferenceCode),
			relationship: OBJECT_RELATIONSHIP.DATA_SET_CARDS_SECTIONS,
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

		setCardsSections(
			cardsSections.map((section) => {
				if (section.name !== cardsSection.name) {
					return section;
				}

				const nextCardSection = {...cardsSection};

				delete nextCardSection.externalReferenceCode;
				delete nextCardSection.field;

				return nextCardSection;
			})
		);

		openDefaultSuccessToast();
	};

	const saveFDSCardsSection = async ({
		cardsSection,
		closeModal,
		field,
	}: {
		cardsSection: ICardsSection;
		closeModal: Function;
		field: IField;
	}) => {
		setSaveButtonDisabled(true);

		let method;
		let url;

		if (cardsSection.externalReferenceCode) {
			method = 'PATCH';

			url = getDataSetResourceURL({
				dataSetERC: dataSet.externalReferenceCode,
				relatedResourceERC: cardsSection.externalReferenceCode,
				relationship: OBJECT_RELATIONSHIP.DATA_SET_CARDS_SECTIONS,
			});
		}
		else {
			method = 'POST';

			url = getDataSetResourceURL({
				dataSetERC: dataSet.externalReferenceCode,
				relationship: OBJECT_RELATIONSHIP.DATA_SET_CARDS_SECTIONS,
			});
		}

		const response = await fetch(url, {
			body: JSON.stringify({
				fieldName: field.name,
				name: cardsSection.name,
			}),
			headers: DEFAULT_FETCH_HEADERS,
			method,
		});

		setSaveButtonDisabled(false);

		if (!response.ok) {
			openDefaultFailureToast();

			return;
		}

		const fdsCardSection: IFDSCardsSection = await response.json();

		closeModal();

		setCardsSections(
			cardsSections.map((cardSection) => {
				if (cardSection.name !== fdsCardSection.name) {
					return cardSection;
				}

				return {
					...cardSection,
					externalReferenceCode: fdsCardSection.externalReferenceCode,
					field: {
						name: fdsCardSection.fieldName,
					},
				};
			})
		);

		openDefaultSuccessToast();
	};

	useEffect(() => {
		getFDSCardsSections();

		// eslint-disable-next-line react-compiler/react-compiler
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<ClayLayout.ContentCol className="c-gap-4">
			<FieldAssignmentTable
				emptyStateMessage={Liferay.Language.get(
					'this-visualization-mode-will-not-be-shown-until-you-assign-at-least-one-field-to-a-card-element'
				)}
				fieldAssignments={cardsSections}
				fieldTreeItems={fieldTreeItems}
				labelColumnHeader={Liferay.Language.get('card-element')}
				modalProps={props}
				onClearSelection={(cardsSection) =>
					clearFDSCardSection({cardsSection})
				}
				onSelect={({closeModal, fieldAssignment, selectedField}) =>
					selectedField
						? saveFDSCardsSection({
								cardsSection: fieldAssignment,
								closeModal,
								field: selectedField,
							})
						: clearFDSCardSection({
								cardsSection: fieldAssignment,
								closeModal,
							})
				}
				saveButtonDisabled={saveButtonDisabled}
			/>
		</ClayLayout.ContentCol>
	);
}
