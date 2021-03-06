import { Injectable } from '@angular/core';
import {BackendServiceAPI} from './backend-service-api';
import {TranslationProject} from './translation-project';

@Injectable()
export class BackendLocalStorageService extends BackendServiceAPI {

  private PRAEFIX = 'tinytranslator.';
  private PRAEFIX_PROJECT = this.PRAEFIX + 'project.';

  constructor() {
    super();
    if (!localStorage) {
      throw new Error('oops, local storage not supported');
    }
  }

  /**
   * Store a project.
   */
  store(project: TranslationProject) {
    console.log('project stored in local storage');
    if (!project.id) {
      project.id = BackendServiceAPI.generateUUID();
    }
    localStorage.setItem(this.keyForProject(project), project.serialize());
  }

  /**
   * Get all stored projects.
   */
  projects(): TranslationProject[] {
    console.log('projects retrieved from local storage');
    let projectKeys = this.getProjectKeys();
    return projectKeys.map(key => {return TranslationProject.deserialize(localStorage.getItem(key))});
  }

  delete(project: TranslationProject) {
    if (project && project.id) {
      let key = this.keyForProject(project);
      localStorage.removeItem(key);
    }
  }

  private keyForProject(project: TranslationProject) {
    return this.PRAEFIX_PROJECT + project.id;
  }

  private getProjectKeys(): string[] {
    let result = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.PRAEFIX_PROJECT)) {
        result.push(key);
      }
    }
    return result;
  }
}
