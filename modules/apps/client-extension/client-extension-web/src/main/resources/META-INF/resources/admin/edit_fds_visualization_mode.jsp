<%--
/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */
--%>

<%@ include file="/admin/init.jsp" %>

<%
EditClientExtensionEntryDisplayContext<FDSVisualizationModeCET> editClientExtensionEntryDisplayContext = (EditClientExtensionEntryDisplayContext)renderRequest.getAttribute(ClientExtensionAdminWebKeys.EDIT_CLIENT_EXTENSION_ENTRY_DISPLAY_CONTEXT);

FDSVisualizationModeCET fdsVisualizationModeCET = editClientExtensionEntryDisplayContext.getCET();
%>

<aui:field-wrapper cssClass="form-group">
	<aui:input label="js-url" name="url" required="<%= true %>" type="text" value="<%= fdsVisualizationModeCET.getURL() %>" />

	<div class="form-text">
		<liferay-ui:message key="enter-the-url-of-the-javascript-file-that-renders-the-frontend-data-set-visualization-mode" />
	</div>
</aui:field-wrapper>

<aui:field-wrapper cssClass="form-group">
	<aui:input label="icon" name="thumbnail" type="text" value="<%= fdsVisualizationModeCET.getThumbnail() %>" />

	<div class="form-text">
		<liferay-ui:message key="enter-the-name-of-the-clay-icon-that-represents-this-visualization-mode-in-the-data-set-toolbar" />
	</div>
</aui:field-wrapper>