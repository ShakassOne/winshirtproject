
import React from 'react';
import StarBackground from '@/components/StarBackground';
import AdminNavigation from '@/components/admin/AdminNavigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GeneralSettings from '@/components/admin/settings/GeneralSettings';
import SyncSettingsManager from '@/components/admin/settings/SyncSettingsManager';
import FtpSettingsManager from '@/components/admin/settings/FtpSettingsManager';
import HomeIntroManager from '@/components/admin/settings/HomeIntroManager';
import SyncDebugTool from '@/components/admin/settings/SyncDebugTool';

const AdminSettingsPage: React.FC = () => {
  return (
    <>
      <StarBackground />
      <AdminNavigation />
      
      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4 md:px-8">
          <h1 className="text-3xl font-bold mb-8 text-white text-center">
            Paramètres de l'application
          </h1>
          
          <SyncDebugTool />
          
          <Tabs defaultValue="general" className="winshirt-card p-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="content">Home Intro</TabsTrigger>
              <TabsTrigger value="sync">Synchronisation</TabsTrigger>
              <TabsTrigger value="ftp">FTP</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-6">
              <GeneralSettings />
            </TabsContent>
            
            <TabsContent value="content" className="space-y-6">
              <HomeIntroManager />
            </TabsContent>
            
            <TabsContent value="sync" className="space-y-6">
              <SyncSettingsManager />
            </TabsContent>
            
            <TabsContent value="ftp" className="space-y-6">
              <FtpSettingsManager />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </>
  );
};

export default AdminSettingsPage;
