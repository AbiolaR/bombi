import { Location } from '@angular/common';
import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanDeactivateFn } from '@angular/router';
import { PreviousRouteService } from '../services/previous-route.service';
import { CommunicationService } from '../services/communication.service';

export const closeDialogGuard: CanDeactivateFn<unknown> = (component, currentRoute, currentState, nextState) => {
  const dialog = inject(MatDialog);
  const location = inject(Location);
  const previousRouteService = inject(PreviousRouteService);
  const communicationService = inject(CommunicationService);
  let allowedUrls = communicationService.getAllowedNavigationUrls() || [];

  if (dialog.openDialogs.length > 0) {
    dialog.closeAll();
    if (!allowedUrls.includes(nextState.url)) {
      location.go(currentState.url);
      return false;
    }
  }
  return true;
};
