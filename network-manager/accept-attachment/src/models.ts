// This is a generated file. Modifications will be overwritten.
import { BaseModel, Dict, integer, Integer, Optional, transformValue } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'Community::NetworkManager::AcceptAttachment';

    @Exclude()
    protected readonly IDENTIFIER_KEY_ID: string = '/properties/Id';

    @Expose({ name: 'AttachmentId' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'attachmentId', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    attachmentId?: Optional<string>;
    @Expose({ name: 'AttachmentType' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'attachmentType', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    attachmentType?: Optional<string>;
    @Expose({ name: 'AttachmentState' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'attachmentState', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    attachmentState?: Optional<string>;
    @Expose({ name: 'Id' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'id', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    id?: Optional<string>;
    @Expose({ name: 'AttachmentUpdatedAt' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'attachmentUpdatedAt', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    attachmentUpdatedAt?: Optional<string>;

    @Exclude()
    public getPrimaryIdentifier(): Dict {
        const identifier: Dict = {};
        if (this.id != null) {
            identifier[this.IDENTIFIER_KEY_ID] = this.id;
        }

        // only return the identifier if it can be used, i.e. if all components are present
        return Object.keys(identifier).length === 1 ? identifier : null;
    }

    @Exclude()
    public getAdditionalIdentifiers(): Array<Dict> {
        const identifiers: Array<Dict> = new Array<Dict>();
        // only return the identifiers if any can be used
        return identifiers.length === 0 ? null : identifiers;
    }
}

export class TypeConfigurationModel extends BaseModel {
    ['constructor']: typeof TypeConfigurationModel;



}

