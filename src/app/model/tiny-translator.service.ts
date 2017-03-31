import {Inject, Injectable} from '@angular/core';
import {ITranslationMessagesFile } from 'ngx-i18nsupport/dist';
import {TranslationFile} from './translation-file';
import {isNullOrUndefined} from 'util';
import {BackendServiceAPI} from './backend-service-api';
import {TranslationProject} from './translation-project';
import {Observable} from 'rxjs';
import {DownloaderService} from './downloader.service';

@Injectable()
export class TinyTranslatorService {

  /**
   * List of projects for work.
   */
  private _projects: TranslationProject[];

  /**
   * The current project.
   */
  private _currentProject: TranslationProject;

  constructor(private backendService: BackendServiceAPI, private downloaderService: DownloaderService) {
    this._projects = this.backendService.projects();
  }

  /**
   * Add a new project.
   * @param projectName
   * @param files selected xlf files to translate
   * @return list of errors found in file selection.
   */
  public addProject(project: TranslationProject): string[] {
    this._projects.push(project);
    this.backendService.store(project);
    // TODO error handling
    return [];
  }

  /**
   * Create a new project.
   * (you must add it with addProject to use it).
   * @param projectName
   * @param files selected xlf file to translate
   * (normally one, in case of xmb it can be 2, file to translate and master
   * @return {TranslationProject}
   */
  public createProject(projectName: string, files: FileList): Observable<TranslationProject> {
    return TranslationFile.fromUploadedFile(files.item(0)).map((file: TranslationFile) => {
      console.log('Project file created');
      return new TranslationProject(projectName, file); // TODO handle xmb 2 files
    });
  }

  /**
   * Test, wether the project selection is ready to start.
   * This is the case, if there is a valid xlf file selected.
   * @return {boolean}
   */
  public canStartWork(): boolean {
    return this._projects && this._projects.length > 0 && !this.hasErrors();
  }

  public setCurrentProject(project: TranslationProject) {
    if (!this._projects.find(p => p === project)) {
      throw new Error('oops, selected project not in list');
    }
    this._currentProject = project;
  }

  public currentProject(): TranslationProject {
    return this._currentProject;
  }

  /**
   * Check, wether there are errors in any of the selected files.
   * @return {boolean}
   */
  public hasErrors(): boolean {
    if (!this._projects || this._projects.length === 0) {
      return false;
    }
    const projectWithErrors = this._projects.find((p) => p.hasErrors());
    return !isNullOrUndefined(projectWithErrors);
  }

  public projects(): TranslationProject[] {
    return this._projects;
  }

  public commitChanges(project: TranslationProject) {
    this.backendService.store(project);
  }

  public saveProject(project: TranslationProject) {
    this.downloaderService.downloadXliffFile(project.translationFile.name, project.translationFile.editedContent());
    project.translationFile.markExported();
    this.commitChanges(project);
  }

  public deleteProject(project: TranslationProject) {
    this.backendService.delete(project);
    let index = this._projects.findIndex(p => p === project);
    if (index >= 0) {
      this._projects = this._projects.slice(0, index).concat(this._projects.slice(index + 1));
    }
  }
}